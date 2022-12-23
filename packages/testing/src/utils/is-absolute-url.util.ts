import { URL } from 'url';

export const isAbsoluteUrl = (urlString: string) => {
  const url = new URL(urlString, 'http://opra.test/')
  return url.host !== 'opra.test';
}
