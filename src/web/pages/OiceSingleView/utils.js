/* global branch: true */

import _get from 'lodash/get';

import i18n from 'common/utils/i18n';

import {
  DOMAIN_URL,
  PLAY_STORE_URL,
} from 'common/constants';
import { LOG_KEY } from 'common/constants/key';

export function getDesktopURL(uuid, language) {
  return `${DOMAIN_URL}/story/${uuid}?lang=${language}`;
}

export function getNextEpisodeOice(oice) {
  return {
    ...oice.nextEpisode,
    // add required og information
    storyName: oice.storyName,
    language: oice.language,
  };
}

export function getDeepLinkObject({ channel, oice, data = {} }) {
  const {
    image,
    ogImage,
    uuid,
    ogDescription,
    name,
    storyName,
    storyDescription,
    description,
  } = oice;

  const $og_image_url = (
    _get(ogImage, 'button') ||
    _get(image, 'button') ||
    `${DOMAIN_URL}/static/img/oice-default-cover.jpg`
  );
  const $og_description = storyDescription || ogDescription || description || i18n.t('site:description');
  const $og_title = `${storyName}: ${name}`;
  const language = oice.language;
  const desktopUrl = getDesktopURL(uuid, language);

  return ({
    channel,
    data: {
      log_key: LOG_KEY,
      uuid,
      language,
      $desktop_url: desktopUrl,
      $android_url: PLAY_STORE_URL,
      $ios_url: desktopUrl,
      $og_title,
      $og_description,
      $og_image_url,
      ...data,
    },
  });
}

export function initializeDeepView({ oice, data = {} }) {
  // Turn page to a deep view
  branch.deepview(
    // get deep link data
    getDeepLinkObject({
      channel: 'deepviewButton',
      data: {
        referrer2: document.referrer,
        ...data,
      },
      oice,
    }),
  );
}
