import i18next from 'i18next';
import { LanguageDetector } from 'i18next-express-middleware';
import Cache from 'i18next-localstorage-cache';
import BrowserLanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en';
import ja from '../locales/ja';
import zh_HK from '../locales/zh-HK';
import zh_TW from '../locales/zh-TW';

import { SUPPORTED_STORY_LANGUAGES } from '../constants/i18n';

const options = {
  debug: false,
  fallbackLng: 'en',
  resources: {
    en,
    'en-AU': en,
    'en-BZ': en,
    'en-CA': en,
    'en-GB': en,
    'en-IE': en,
    'en-JM': en,
    'en-NZ': en,
    'en-US': en,
    ja,
    'ja-JP': ja,
    zh: zh_TW,
    'zh-CN': zh_TW,
    'zh-HK': zh_HK,
    'zh-MO': zh_HK,
    'zh-TW': zh_TW,
  },
  detection: {
    // order and from where user language should be detected
    order: ['cookie', 'localStorage', 'navigator', 'header', 'htmlTag'],

    // keys or params to lookup language from
    lookupCookie: 'i18n-oice',
    lookupLocalStorage: 'i18n-oice',

    // cache user language on
    caches: ['cookie', 'localStorage'],
  },
};

let instance = i18next;

if (typeof window === 'undefined') {
  // Node.js environment
  instance = instance.use(LanguageDetector);
} else {
  // Browser environment
  instance = instance.use(BrowserLanguageDetector);
}

const i18n = instance.use(Cache)
                     .init(options);

// Strip away region code, e.g. `en-US` will become `en`
const stripRegionCode = code => code.match(/^([a-z]{2})?/i)[1];
export const mapLanguageCode = (languageCode) => {
  if (/^zh/i.test(languageCode)) {
    // Map language code start with `zh` to `zh-HK`
    return 'zh-HK';
  }
  return stripRegionCode(languageCode);
};

export const mapUILanguageCode = (languageCode) => {
  // Map language code start with `zh` to `zh-HK` or `zh-TW` depending on the region
  if (/^zh/i.test(languageCode)) {
    if (languageCode.includes('HK') || languageCode.includes('MO')) {
      return 'zh-HK';
    }
    return 'zh-TW';
  }
  return stripRegionCode(languageCode);
};

// Handle user with language other than supported language in the default story language
export const isStoryLanguageSupported = (languageCode) => {
  const isEqualToLanguageCode = language => language === languageCode;
  return !!SUPPORTED_STORY_LANGUAGES.find(isEqualToLanguageCode);
};


const ZH_CODES = ['zh-HK', 'zh-TW', 'zh-CN'];
export function getLocalizedValue(object) {
  const code = i18n.language;
  let value = object[code];
  if (!value && /^zh/.test(code)) {
    const zhCode = ZH_CODES.find(zHCode => zHCode in object);
    value = object[zhCode];
  }

  if (!value && 'en' in object) {
    value = object.en;
  }

  if (!value && object) {
    value = Object.values(object)[0];
  }

  return value;
}

export default i18n;
