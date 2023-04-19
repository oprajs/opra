import isPlainObject from 'putil-isplainobject';

export function encodePathComponent(resource: string, key?: any, typeCast?: string): string {
  if (resource == null)
    return '';
  let keyString = '';
  if (key !== '' && key != null) {
    if (isPlainObject(key)) {
      const arr: string[] = [];
      for (const k of Object.keys(key)) {
        arr.push(encodeURIComponent(k) + '=' + encodeURIComponent(key[k]));
      }
      keyString = arr.join(';');
    } else keyString = encodeURIComponent('' + key);
  }
  if (typeCast)
    typeCast = encodeURIComponent(typeCast);

  return encodeURIComponent(resource).replace(/%24/, '$') +
      (keyString ? '@' + keyString : '') +
      (typeCast ? '::' + typeCast : '')
}
