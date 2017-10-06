import moment from 'moment';

const LAST_EDITING_OICE_KEY = 'LAST_EDITING_OICE';
const OICE_LAST_EDIT_TIME_KEY = 'OICE_LAST_EDIT_TIME';

export function getLastEditingOice() {
  const serializedOice = sessionStorage.getItem(LAST_EDITING_OICE_KEY);
  const oice = JSON.parse(serializedOice);
  if (typeof oice === 'object') {
    return oice;
  }
  return undefined;
}

export function setLastEditingOice(oice) {
  if (typeof oice === 'object') {
    const serializedOice = JSON.stringify(oice);
    sessionStorage.setItem(LAST_EDITING_OICE_KEY, serializedOice);
    return true;
  }
  return false;
}

export function clearLastEditingOice() {
  sessionStorage.removeItem(LAST_EDITING_OICE_KEY);
  return true;
}

export function getOiceLastEditTime(oiceId) {
  const date = moment(localStorage.getItem(`${OICE_LAST_EDIT_TIME_KEY}_${oiceId}`));
  return date.isValid() ? date : undefined;
}

export function setOiceLastEditTime(oiceId) {
  localStorage.setItem(`${OICE_LAST_EDIT_TIME_KEY}_${oiceId}`, moment().format());
}
