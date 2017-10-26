import { MAX_AUDIO_FILE_SIZE } from 'asset-library/constants';

export function getFileSizeString(numBytes) {
  if (!Number.isSafeInteger(numBytes)) return `${numBytes} bytes`;

  const units = ['Kb', 'Mb', 'Gb'];
  return units.reduce((result, unit, index) => {
    if (Number.isNaN(Number(result))) return result;
    if (
      (index === units.length) ||
      (result < 1000)
    ) {
      return `${result.toFixed(1)} ${unit}`;
    }
    return result / 1000;
  }, numBytes / 1000); // start from Kb
}

export function isFileSizeExceedLimit(size) {
  if (
    Number.isSafeInteger(size) &&
    size <= MAX_AUDIO_FILE_SIZE.BYTE &&
    size > 0
  ) {
    return false;
  }
  return true;
}
