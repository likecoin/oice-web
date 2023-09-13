import { SRV_ENV } from '../constants';
import { USER_ROLE_PRO, USER_ROLE_ADMIN } from '../constants/userRoles';

export function isMobileAgent() {
  let check = false;
  /* eslint-disable */
  // From http://detectmobilebrowsers.com/
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  /* eslint-enable */
  return check;
}

export const backToWeb = () => {
  // const hostname = window.location.hostname;
  // const protocol = window.location.protocol;
  window.location.assign('/');
};

export const mobileRedirectToWeb = () => {
  if (isMobileAgent()) {
    backToWeb();
  }
};

export const setInnerHTML = htmlString => ({
  dangerouslySetInnerHTML: { __html: htmlString },
});

export function setInnerHTMLWithParsing(string, options = { link: true }) {
  let htmlString = (string || '').replace(/\n/g, '<br/>');
  if (options.link) {
    htmlString = htmlString.replace(/(https?:\/\/[^\s]+)/g, url => (
      `<a href="${url}" target="_blank">${url}</a>`
    ));
  }
  return setInnerHTML(htmlString);
}

export function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  const hasOwn = Object.prototype.hasOwnProperty;
  for (let i = 0; i < keysA.length; i += 1) {
    if (!hasOwn.call(objB, keysA[i]) ||
        objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }

    const valA = objA[keysA[i]];
    const valB = objB[keysA[i]];

    if (valA !== valB) {
      return false;
    }
  }

  return true;
}

export function shouldPureComponentUpdate(nextProps, nextState) {
  return !shallowEqual(this.props, nextProps) ||
         !shallowEqual(this.state, nextState);
}

export const getIntegerFromPropertyValue = (element, property) => {
  if (element && property) {
    const value = window.getComputedStyle(element).getPropertyValue(property);
    return parseInt(value, 10);
  }
  return 0;
};

export const getHTMLTitle = (t, overridenSubtitle, module) => {
  let subtitle = overridenSubtitle;

  if (!subtitle) {
    switch (module) {
      case 'editor':
        subtitle = t('editor:title');
        break;
      case 'asset-library':
        subtitle = t('AssetStore:title');
        break;
      case 'admin-panel':
      case 'ui-demo':
      case 'web':
      default:
        break;
    }
  } else {
    switch (module) {
      case 'asset-library':
        return `${subtitle} - ${t('AssetStore:title')} | ${t('site:title')}`;
      default:
        break;
    }
  }

  return (subtitle ? `${subtitle} - ` : '') + t('site:title');
};

export const handleOgMetaChanges = (title, description, url, image) => {
  const allMetaElements = document.getElementsByTagName('meta');
  [...allMetaElements].forEach((meta) => {
    const metaProperty = meta.getAttribute('property');
    switch (metaProperty) {
      case 'og:title':
        meta.setAttribute('content', title);
        break;
      case 'og:description':
        meta.setAttribute('content', description);
        break;
      case 'og:url':
        meta.setAttribute('content', url);
        break;
      case 'og:image':
        meta.setAttribute('content', image);
        break;
      default: break;
    }
  });
};

export const getThumbnail = (url, size = 400) => {
  if (typeof url === 'string') {
    switch (SRV_ENV) {
      case 'production':
      case 'kubernetes':
        return url.replace('upload', `upload/thumbnail/${size}`);
      default:
        return url;
    }
  }
  return '';
};

export const convertDataURLtoFile = (dataurl) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const name = 'image.'.concat(mime.substr(mime.lastIndexOf('/') + 1));
  const blob = new Blob([u8arr], { type: mime });
  blob.name = name;
  return blob;
};

export const getFilename = name => name.split('.')[0];

export async function getImageUrlFromFile(imageFile) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const src = event.target.result;
      const image = new Image();
      image.src = src;
      image.onload = () => resolve(src);
    };
    fileReader.readAsDataURL(imageFile);
  });
}

export function getWindowHeight() {
  return (
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight
  );
}
