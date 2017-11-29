export function getCSSValue(element, property) {
  return window.getComputedStyle(element).getPropertyValue(property);
}

export function getCSSIntegerValue(element, property) {
  return parseInt(getCSSValue(element, property), 10);
}
