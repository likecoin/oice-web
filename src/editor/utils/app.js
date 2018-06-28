import * as ASSET_TYPE from 'common/constants/assetTypes';
import { DOMAIN_URL } from 'common/constants';

export const checkAssetType = (assetType) => {
  const index = ASSET_TYPE.LIST.indexOf(assetType);
  return { isValid: index !== -1, index };
};

const SCREEN_WIDTH = 1080;
const SCREEN_HEIGHT = 1080;
const XOFFSET = 50;
const YOFFSET = 50;
export const setDefaultConfigForCharacterFg = (character) => {
  const { height, width } = character;
  let {
    // xDl,
    // xDm,
    // xDr,
    xl,
    xm,
    xr,
    // yDl,
    // yDm,
    // yDr,
    yl,
    ym,
    yr,
  } = character.config;

  if (Number.isNaN(Number(xl))) {
    if (width < SCREEN_WIDTH) {
      xl = Math.round(((SCREEN_WIDTH / 2) - width) / 2);
    } else {
      xl = 0;
    }
  }
  if (Number.isNaN(Number(xr))) xr = SCREEN_WIDTH - xl - width;
  if (Number.isNaN(Number(xm))) xm = Math.round((SCREEN_WIDTH - width) / 2);

  if (Number.isNaN(Number(yl))) {
    if (height < SCREEN_HEIGHT) {
      yl = SCREEN_HEIGHT - height;
    } else {
      yl = 0;
    }
  }
  if (Number.isNaN(Number(yr))) yr = yl;
  if (Number.isNaN(Number(ym))) ym = yl;

  // if (Number.isNaN(Number(xDl))) xDl = xl - XOFFSET;
  // if (Number.isNaN(Number(xDm))) xDm = xm;
  // if (Number.isNaN(Number(xDr))) xDr = xr - XOFFSET;

  // if (Number.isNaN(Number(yDl))) yDl = yl + XOFFSET;
  // if (Number.isNaN(Number(yDm))) yDm = ym + YOFFSET;
  // if (Number.isNaN(Number(yDr))) yDr = yr + YOFFSET;

  const config = {
    xl, xm, xr, yl, ym, yr,
  };

  console.log('Helo', config);

  return config;
};

export const getAudioMp4Url = (audio) => {
  if (audio) {
    const url = audio.url.replace(/\/[^/]+\/?$/, '');
    return `${DOMAIN_URL}${url}/audio.mp4`;
  }
  return null;
};
