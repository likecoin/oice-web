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

  if (Number.isNaN(xl)) {
    if (width < SCREEN_WIDTH) {
      xl = Math.round(((SCREEN_WIDTH / 2) - width) / 2);
    } else {
      xl = 0;
    }
  }
  if (Number.isNaN(xr)) xr = SCREEN_WIDTH - xl - width;
  if (Number.isNaN(xm)) xm = Math.round((SCREEN_WIDTH - width) / 2);

  if (Number.isNaN(yl)) {
    if (height < SCREEN_HEIGHT) {
      yl = SCREEN_HEIGHT - height;
    } else {
      yl = 0;
    }
  }
  if (Number.isNaN(yr)) yr = yl;
  if (Number.isNaN(ym)) ym = yl;

  // if (Number.isNaN(xDl)) xDl = xl - XOFFSET;
  // if (Number.isNaN(xDm)) xDm = xm;
  // if (Number.isNaN(xDr)) xDr = xr - XOFFSET;

  // if (Number.isNaN(yDl)) yDl = yl + XOFFSET;
  // if (Number.isNaN(yDm)) yDm = ym + YOFFSET;
  // if (Number.isNaN(yDr)) yDr = yr + YOFFSET;

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
