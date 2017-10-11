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

  if (isNaN(xl)) {
    if (width < SCREEN_WIDTH) {
      xl = Math.round(((SCREEN_WIDTH / 2) - width) / 2);
    } else {
      xl = 0;
    }
  }
  if (isNaN(xr)) xr = SCREEN_WIDTH - xl - width;
  if (isNaN(xm)) xm = Math.round((SCREEN_WIDTH - width) / 2);

  if (isNaN(yl)) {
    if (height < SCREEN_HEIGHT) {
      yl = SCREEN_HEIGHT - height;
    } else {
      yl = 0;
    }
  }
  if (isNaN(yr)) yr = yl;
  if (isNaN(ym)) ym = yl;

  // if (isNaN(xDl)) xDl = xl - XOFFSET;
  // if (isNaN(xDm)) xDm = xm;
  // if (isNaN(xDr)) xDr = xr - XOFFSET;

  // if (isNaN(yDl)) yDl = yl + XOFFSET;
  // if (isNaN(yDm)) yDm = ym + YOFFSET;
  // if (isNaN(yDr)) yDr = yr + YOFFSET;

  const config = {
    xl, xm, xr, yl, ym, yr,
  };

  return config;
};

export const getAudioMp4Url = (audio) => {
  if (audio) {
    const url = audio.url.replace(/\/[^/]+\/?$/, '');
    return `${DOMAIN_URL}${url}/audio.mp4`;
  }
  return null;
};
