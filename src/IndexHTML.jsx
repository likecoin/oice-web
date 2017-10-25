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
} from './common/constants/key';


const DEBUG = process.env.NODE_ENV !== 'production';

function getFontUrl(language) {
  if (typeof language === 'string') {
    const lang = language.substring(0, 2).toLowerCase();
    switch (lang) {
      case 'ja':
        return 'https://fonts.googleapis.com/earlyaccess/notosansjp.css';
      case 'zh':
        return 'https://fonts.googleapis.com/earlyaccess/notosanstc.css';
      default:
        break;
    }
  }
  return null;
}

export default class IndexHTML extends React.Component {
  static defaultProps = {
    meta: {},
    module: 'web',
  }

  static propTypes = {
    children: PropTypes.node,
    meta: PropTypes.object,
    module: PropTypes.string,
  }

  render() {
    const {
      children,
      module,
      meta,
    } = this.props;

    const fontUrl = getFontUrl(meta.ogLocale);
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
          <meta content={meta.ogLocale} property="og:locale" />
          <meta content="website" property="og:type" />
          <meta content="black" name="apple-mobile-web-app-status-bar-style" />
          <meta content="yes" name="apple-mobile-web-app-capable" />
          <meta content="oice" name="apple-mobile-web-app-title" />

          <title>{meta.title}</title>

          {!DEBUG &&
            <link
              href={`/build/${module}.css?v=${VERSION}`}
              rel="stylesheet"
              type="text/css"
            />
          }
          {!!fontUrl &&
            <link href={fontUrl} rel="stylesheet" type="text/css" />
          }
          <link
            href="/img/favicon.ico"
            rel="shortcut icon"
            type="image/x-icon"
          />
          <link href="/img/favicon.ico" rel="icon" type="image/x-icon" />
          <link href="/img/apple-touch-icon.png" rel="apple-touch-icon" />

          <style dangerouslySetInnerHTML={{ __html: '.async-hide { opacity: 0 !important}' }} />
          <script src={`/static/vendor/google-optimize.js?v=${VERSION}`} />
          <script src="https://use.fontawesome.com/7f71a010f8.js" />
          {!IS_DEV_MODE &&
            <script src="https://www.gstatic.com/firebasejs/4.1.1/firebase.js" />
          }
          <script src={`/static/vendor/ga.js?v=${VERSION}`} />
          <script src="https://www.google-analytics.com/analytics.js" async />
          <script src={`/static/vendor/autotrack.js?v=${VERSION}`} async />
          <script src="/static/vendor/riveted-0.6.1.min.js" />
          <script>riveted.init();</script>
          <script src={`/static/vendor/gtm.js?v=${VERSION}`} />
          <script src={`/static/vendor/branch-deepview.js?v=${VERSION}`} />
          <script src={`/static/vendor/intercom.js?v=${VERSION}`} />
        </head>
        <body>
          <noscript>
            <iframe
              height="0"
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
              style={{ display: 'none', visibility: 'hidden' }}
              width="0"
            />
          </noscript>
          <div id="app">{children}</div>
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
