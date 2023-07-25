import { URL } from 'url';

const URL_PATTERN = /^(https?:\/\/.)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/i;

export function isUrlString(url: string) {
  return URL_PATTERN.test(url);
}

export const isAbsoluteUrl = (urlString: string) => {
  return !urlString.includes('://') &&
      (new URL(urlString, 'http://tempuri.org/')).host !== 'tempuri.org';
}
