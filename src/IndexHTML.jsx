import React from 'react';
import PropTypes from 'prop-types';

import {
  VERSION,
  ANDROID_APP,
  IOS_APP,
  FACEBOOK_APP_ID,
  IS_DEV_MODE,
  CRISP_WEBSITE_ID,
} from './common/constants';

import {
  GA_TRACKING_ID,
  SENTRY_CLIENT_ID,
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
    const jsonLdObject = [{
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
    }, {
      '@context': 'http://www.schema.org',
      '@type': 'WebApplication',
      name: 'oice',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'All',
      url: 'https://oice.com',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    }];

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
          <link rel="canonical" href={meta.ogUrl} />
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
          <link rel="preload" href={`/build/vendor.css?v=${VERSION}`} as="style" />
          <link rel="preload" href={`/build/common.css?v=${VERSION}`} as="style" />
          <link rel="preload" href={`/build/${module}.css?v=${VERSION}`} as="style" />
          <link rel="preload" href={`/build/vendor.js?v=${VERSION}`} as="script" />
          <link rel="preload" href={`/build/common.js?v=${VERSION}`} as="script" />
          {modules.map(m => (
            <link
              key={m}
              rel={module === m ? 'preload' : 'prefetch'}
              href={`/build/${m}.js?v=${VERSION}`}
              as="script"
            />
          ))}

          {!DEBUG && ['vendor', 'common', module].map(m => (
            <link
              href={`/build/${m}.css?v=${VERSION}`}
              rel="stylesheet"
              type="text/css"
            />
          ))}
          <link
            href="/img/favicon.ico"
            rel="shortcut icon"
            type="image/x-icon"
          />
          <link href="/img/favicon.ico" rel="icon" type="image/x-icon" />
          <link href="/img/apple-touch-icon.png" rel="apple-touch-icon" />
          {!IS_DEV_MODE && <script src={`https://js.sentry-cdn.com/${SENTRY_CLIENT_ID}.min.js`} crossorigin="anonymous" />}
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
          <style dangerouslySetInnerHTML={{ __html: '.async-hide { opacity: 0 !important}' }} />
          <script src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} async />
          <script dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}');`,
            }}
          />
          <script src={`/static/vendor/branch-deepview.js?v=${VERSION}`} />
          <script dangerouslySetInnerHTML={{ __html: `window.CRISP_WEBSITE_ID="${CRISP_WEBSITE_ID}";` }} />
          <script src={`/static/vendor/crisp.js?v=${VERSION}`} />
          {/* Typekit */}
          <script src="https://use.typekit.net/lds7dmt.js" />
          <script dangerouslySetInnerHTML={{ __html: 'try{Typekit.load({ async: true });}catch(e){}' }} />
          <script src="https://js.stripe.com/v3/" async />
        </head>
        <body>
          <div id="app" className={className}>
            {children}
          </div>
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdObject) }}
          />
        </body>
      </html>
    );
  }
}
