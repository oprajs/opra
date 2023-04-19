import cookie from 'cookie';

export interface CookieOptions extends cookie.CookieSerializeOptions {
  signed?: boolean;
}
