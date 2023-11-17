import express from 'express';
import path from 'path';
import request from 'superagent';
import classNames from 'classnames';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { match, Route, IndexRoute, RouterContext } from 'react-router';
import cookieParser from 'cookie-parser';

import i18nMiddleware from 'i18next-express-middleware';
import { I18nextProvider } from 'react-i18next';
import i18n from './common/utils/i18n';

import { API_URL, IS_DEV_MODE } from './common/constants';
import { getHTMLTitle } from './common/utils';
import * as OiceAPI from './common/api/oice';
import * as LibraryAPI from './common/api/library';
import * as UserAPI from './common/api/user';

import IndexHTML from './IndexHTML';

import oembed from './server/oembed';

const PORT = process.env.SRV_PORT || 3000;
const DEBUG = process.env.NODE_ENV !== 'production';
const DIST_PATH = path.join(__dirname, '../dist');

const routes = (
  <Route key="web" path="/*">
    {DEBUG && <Route key="ui-demo" path="ui-demo" />}
    <Route key="editor" path="edit*" />,
  </Route>
);

const server = express();

if (DEBUG) {
  const webpack = require('webpack');
  const webpackMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackConfig = require('../webpack.config');

  const compiler = webpack(webpackConfig);
  server.use(webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    noInfo: false,
    quiet: false,
    lazy: false,
    watchOptions: {
      aggregateTimeout: 300,
      poll: true,
    },
    stats: {
      colors: true,
      chunks: false,
      'errors-only': true,
    },
    historyApiFallback: true,
  }));
  server.use(webpackHotMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000,
  }));
}

server.use((req, res, next) => {
  const isEmbed = /^\/embed\/oice\/[0-9a-f]{32}/.test(req.url);
  if (!isEmbed) {
    res.setHeader('X-Frame-Options', 'DENY');
  }
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

server.disable('x-powered-by');
server.use(cookieParser());
server.use(i18nMiddleware.handle(i18n));
server.use(express.static(DIST_PATH));
server.use('/oembed', oembed);

server.get('/healthz', (req, res) => {
  res.sendStatus(200);
});

server.get('*', (req, res) => {
  const reqURL = req.url;
  const baseURL = `${DEBUG ? 'http' : 'https'}://${req.get('host')}`;
  match({ routes, location: reqURL }, async (error, redirectLocation, renderProps) => {
    if (error) {
      console.error('500:');
      console.error(error);
      res.status(500).send(error.message);
    } else if (!renderProps) {
      res.status(404).send('Not Found');
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } else {
      const { pathname, query } = renderProps.location;
      const { lang } = query;
      const fullURL = `${baseURL}${pathname}${lang ? `?lang=${lang}` : ''}`;

      const defaultOg = {
        url: fullURL,
        image: `${baseURL}/static/img/banner.jpg`,
      };
      const { t } = req;

      const renderHTML = (props) => {
        const isEditor = props.module === 'editor';
        const isAssetLibrary = props.module === 'asset-library';

        const viewport = classNames(
          `width=${isAssetLibrary || isEditor ? '1024' : 'device-width'},`,
          {
            'initial-scale=1.0, minimum-scale=1.0,': !(isAssetLibrary || isEditor),
          },
          'maximum-scale=1.0,',
          'user-scalable=no'
        );

        const meta = {
          ogDescription: props.meta.ogDescription || t('site:description'),
          ogImage: props.meta.ogImage || defaultOg.image,
          locale: props.meta.locale || req.i18n.language,
          ogLocale: (props.meta.locale || req.i18n.language).replace('-', '_'),
          ogUrl: props.meta.ogUrl || defaultOg.url,
          title: props.meta.title || getHTMLTitle(t, '', props.module),
          viewport,
        };

        const htmlProps = {
          className: props.className,
          meta,
          jsonLds: props.jsonLds || [],
          module: props.module,
          oice: props.oice,
          languages: props.languages,
        };

        const htmlString = renderToStaticMarkup(
          <I18nextProvider i18n={req.i18n}>
            <IndexHTML {...htmlProps}>
              <RouterContext {...renderProps} />
            </IndexHTML>
          </I18nextProvider>
        );

        return `<!doctype html>\n${htmlString}`;
      };

      const isPathStartWith = regexPath => new RegExp(`^/${regexPath}`).test(pathname);

      const props = {
        module: 'web',
        meta: {},
      };

      if (isPathStartWith('$') || isPathStartWith('about')) {
        props.module = 'web';
        props.languages = ['zh-HK', 'zh-TW', 'en', 'ja'];
        props.meta = {
          title: getHTMLTitle(t, t('LandingSection:title'), props.module),
        };
        // TODO: Fetch story from featured stories API
      } else if (isPathStartWith('story/[0-9a-f]{32}/?$')) {
        // Oice single view
        const regexUUID = /[0-9a-f]{32}/;
        const foundUUID = pathname.match(regexUUID);
        const uuid = foundUUID[0];
        props.module = 'web';
        try {
          const oice = await OiceAPI.fetchOiceOgByUUID(uuid);
          props.oice = oice;
          props.languages = oice.supportedLanguages;
          props.meta = {
            ogDescription: oice.ogDescription || oice.description,
            ogImage: oice.storyCover || `${baseURL}/static/img/oice-default-cover.jpg`,
            locale: oice.locale,
            ogUrl: defaultOg.url,
            title: getHTMLTitle(t, oice.ogTitle || `${oice.storyName} - ${oice.name}`, props.module),
          };
          props.jsonLds = [{
            '@context': 'https://schema.org',
            '@type': 'Episode',
            name: oice.ogTitle || oice.name,
            description: oice.ogDescription || oice.description,
            image: [oice.storyCover || `${baseURL}/static/img/oice-default-cover.jpg`],
            url: oice.shareUrl,
            dateModified: oice.updatedAt,
            author: oice.author ? {
              '@type': 'Person',
              name: oice.author.displayName,
              image: oice.author.avatar,
              description: oice.author.description,
              url: `${baseURL}/user/${oice.author.id}`,
            } : undefined,
            partOfSeries: {
              '@context': 'https://schema.org',
              '@type': 'CreativeWorkSeries',
              name: oice.storyName,
              image: oice.storyCover,
              description: oice.storyDescription,
            },
          }];
        } catch (err) {
          console.error('Error in fetchOiceOgByUUID()');
          console.error(err);
        }
      } else if (isPathStartWith('edit')) {
        props.module = 'editor';
      } else if (isPathStartWith('asset') || isPathStartWith('store')) {
        props.module = 'asset-library';

        // Parse library ID from path
        const matchResults = pathname.match(/^\/(asset|store)\/library\/(\d+).*/i);
        if (matchResults) {
          const libraryId = matchResults[2];
          try {
            props.library = await LibraryAPI.fetchLibrary(libraryId);
            const { library } = props;
            props.meta = {
              ogDescription: library.description,
              ogImage: library.image,
              title: getHTMLTitle(t, library.name, props.module),
            };
            props.jsonLds = [{
              '@context': 'https://schema.org',
              '@type': 'MediaGallery',
              image: [library.cover],
              datePublished: library.launchedAt,
              dateModified: library.updatedAt,
              author: library.author ? [{
                '@type': 'Person',
                name: library.author.displayName,
                image: library.author.avatar,
                url: `${baseURL}/user/${library.author.id}`,
              }] : undefined,
            }];
            if (library.price) {
              props.jsonLds.push({
                '@context': 'http://www.schema.org',
                '@type': 'Product',
                name: library.name,
                image: [library.image],
                description: library.description,
                url: `${baseURL}/store/library/${libraryId}`,
                offers: {
                  '@type': 'Offer',
                  price: library.price,
                  priceCurrency: 'USD',
                },
              });
            }
          } catch (err) {
            console.error('Error in fetchLibrary()');
            console.error(err);
            res.status(500).send(`Error occurs when fetching library information ${err}`);
            return;
          }
        }
      } else if (isPathStartWith('ui-demo')) {
        props.module = 'ui-demo';
      } else if (isPathStartWith('admin') && !IS_DEV_MODE) {
        props.module = 'admin-panel';
      } else if (isPathStartWith('user') || isPathStartWith('@')) {
        const matchResults = isPathStartWith('user') ? pathname.match(/^\/user\/(\d+).*/i) : pathname.match(/\/@([a-zA-Z0-9.\-_]+).*/);
        const userKey = matchResults ? matchResults[1] : null;
        if (matchResults) {
          try {
            props.user = await UserAPI.fetchUserProfile(userKey);
          } catch (err) {
            console.error('Error in fetchUserProfile()');
            console.error(err);
            res.redirect('/about');
            return;
          }
        } else {
          const { cookies } = req;
          const cookieKeys = Object.keys(cookies);
          const cookieString = cookieKeys.reduce((acc, key) => (
            `${acc}${key}=${cookies[key]};`
          ), '');
          try {
            props.user = await UserAPI.getUserProfile({ cookie: cookieString });
          } catch (err) {
            console.error('Error in fetchUserProfile()');
            console.error(err);
            res.redirect('/about');
          }
        }

        if (props.user) {
          const { likeCoinId, id } = props.user;
          if (likeCoinId && userKey !== likeCoinId) {
            res.redirect(`/@${likeCoinId}`);
            return;
          } else if (!matchResults) {
            res.redirect(`/user/${id}`);
            return;
          }
          const { user } = props;
          props.meta = {
            ogDescription: `${user.displayName} - ${user.description || 'oice user profile'}`,
            ogImage: user.avatar,
            title: getHTMLTitle(t, user.displayName, props.module),
          };
          props.jsonLds = [{
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            image: [user.avatar],
            author: {
              '@type': 'Person',
              name: user.displayName,
              image: user.avatar,
              description: user.description,
              url: `${baseURL}/user/${user.id}`,
            },
          }];
        }
      } else if (isPathStartWith('competition1718')) {
        props.meta = {
          ogImage: 'https://firebasestorage.googleapis.com/v0/b/api-project-82698378.appspot.com/o/competition1718%2Fbanner.jpg?alt=media&token=ec08ab47-3dac-44b5-a50a-cb3b420bf9b2',
          ogDescription: '第一屆「我自由我導」視覺小說創作比賽共有五十一份參賽作品，全部都列出在比賽專頁上了。快來欣賞這些作品的精彩內容吧，免費的喔！',
          title: '第一屆「我自由我導」視覺小說創作比賽－參賽作品',
          locale: 'zh-HK',
        };
      } else if (isPathStartWith('embed')) {
        props.className = 'embed';
      }

      res.status(200).send(renderHTML(props));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on: ${PORT}`);
});

export default server;
