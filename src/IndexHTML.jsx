import React from 'react';
import PropTypes from 'prop-types';

import {
  VERSION,
  ANDROID_APP,
  IOS_APP,
  FACEBOOK_APP_ID,
  IS_DEV_MODE,
} from './common/constants';

import {
  GTM_CONTAINER_ID,
  SENTRY_DSN,
} from './common/constants/key';


const DEBUG = process.env.NODE_ENV !== 'production';


export default class IndexHTML extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    meta: PropTypes.object,
    module: PropTypes.string,
  }

  static defaultProps = {
    meta: {},
    module: 'web',
  }

  render() {
    const {
      className,
      children,
      module,
      meta,
    } = this.props;

    const modules = ['web', 'editor', 'asset-library'];
    const jsonLdObject = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'oice',
      url: 'https://oice.com',
      logo: 'https://oice.com/static/img/app-icon.png',
      sameAs: [
        'https://v.oice.com',
        'https://twitter.com/oice_app',
        'https://www.facebook.com/oiceapp',
        'https://www.facebook.com/groups/oiceapp',
        'https://embed.ly/provider/oice',
      ],
    };

    return (
      <html lang={meta.ogLocale}>
        <head>
          <meta charset="UTF-8" />
          <meta content={meta.viewport} name="viewport" />
          <meta content={FACEBOOK_APP_ID} property="fb:app_id" />
          <meta property="al:ios:url" content={meta.ogUrl} />
          <meta property="al:ios:app_store_id" content={IOS_APP.STORE_ID} />
          <meta property="al:ios:app_name" content={IOS_APP.NAME} />
          <meta property="al:android:url" content={meta.ogUrl} />
          <meta property="al:android:package" content={ANDROID_APP.PACKAGE} />
          <meta property="al:android:app_name" content={ANDROID_APP.NAME} />
          <meta content={meta.title} property="og:title" />
          <meta content={meta.ogUrl} property="og:url" />
          <meta content={meta.ogImage} property="og:image" />
          <meta content={meta.ogDescription} property="og:description" />
          <meta content={meta.ogDescription} name="description" />
          <meta content={meta.ogLocale} property="og:locale" />
          <meta content="website" property="og:type" />
          <meta content="black" name="apple-mobile-web-app-status-bar-style" />
          <meta content="yes" name="apple-mobile-web-app-capable" />
          <meta content="oice" name="apple-mobile-web-app-title" />

          <title>{meta.title}</title>
          <link rel="preload" href={`/build/manifest.js?v=${VERSION}`} as="script" />
          <link rel="preload" href={`/build/vendor.js?v=${VERSION}`} as="script" />
          <link rel="preload" href={`/build/common.js?v=${VERSION}`} as="script" />
          <link rel="preload" href={`/build/${module}.css?v=${VERSION}`} as="style" />
          {modules.map(m => (
            <link
              key={m}
              rel={module === m ? 'preload' : 'prefetch'}
              href={`/build/${m}.js?v=${VERSION}`}
              as="script"
            />
          ))}

          {!DEBUG &&
            <link
              href={`/build/${module}.css?v=${VERSION}`}
              rel="stylesheet"
              type="text/css"
            />
          }
          <link
            href="/img/favicon.ico"
            rel="shortcut icon"
            type="image/x-icon"
          />
          <link href="/img/favicon.ico" rel="icon" type="image/x-icon" />
          <link href="/img/apple-touch-icon.png" rel="apple-touch-icon" />
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />

          <style dangerouslySetInnerHTML={{ __html: '.async-hide { opacity: 0 !important}' }} />
          <script src="https://cdn.ravenjs.com/3.24.2/raven.min.js" crossorigin="anonymous" />
          <script src={`/static/vendor/ga.js?v=${VERSION}`} />
          <script src="https://www.google-analytics.com/analytics.js" async />
          <script src={`/static/vendor/autotrack.js?v=${VERSION}`} async />
          <script src="/static/vendor/riveted-0.6.1.min.js" />
          <script>riveted.init();</script>
          <script src={`/static/vendor/gtm.js?v=${VERSION}`} />
          <script src={`/static/vendor/branch-deepview.js?v=${VERSION}`} />
          <script src={`/static/vendor/intercom.js?v=${VERSION}`} />
          {/* Typekit */}
          <script src="https://use.typekit.net/lds7dmt.js" />
          <script dangerouslySetInnerHTML={{ __html: 'try{Typekit.load({ async: true });}catch(e){}' }} />
          {!IS_DEV_MODE && <script dangerouslySetInnerHTML={{ __html: `Raven.config('${SENTRY_DSN}').install()` }} />}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdObject) }}
          />
        </head>
        <body>
          <noscript>
            <iframe
              title="google tag manager"
              height="0"
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
              style={{ display: 'none', visibility: 'hidden' }}
              width="0"
            />
          </noscript>
          <div id="app" className={className}>
            {children}
          </div>
          <script
            src={`/build/manifest.js?v=${VERSION}`}
            type="application/javascript"
          />
          <script
            src={`/build/vendor.js?v=${VERSION}`}
            type="application/javascript"
          />
          <script
            src={`/build/common.js?v=${VERSION}`}
            type="application/javascript"
          />
          <script
            src={`/build/${module}.js?v=${VERSION}`}
            type="application/javascript"
          />
          <script src={`/static/vendor/fb.js?v=${VERSION}`} />
        </body>
      </html>
    );
  }
}
