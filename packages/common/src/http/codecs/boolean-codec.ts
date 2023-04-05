import type {HttpParams} from '../http-params.js';

const trueValues = ['true', 't', 'yes', 'y', '1'];
const falseValues = ['false', 'f', 'no', 'n', '0'];

export class BooleanCodec implements HttpParams.Codec {

  decode(value: string): boolean {
    if (value === '')
      return true;
    // noinspection SuspiciousTypeOfGuard
    if (typeof value === 'boolean')
      return value;
    if (trueValues.includes(value.toLowerCase()))
      return true;
    if (falseValues.includes(value.toLowerCase()))
      return false;
    throw new TypeError(`"${value}" is not a valid boolean`);
  }

  encode(value: any): string {
    return typeof value === 'boolean' ?
      (value ? 'true' : 'false') : '';
  }
}
