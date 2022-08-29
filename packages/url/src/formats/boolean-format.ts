import {ValidationError} from '../errors.js';
import {Nullable} from '../types.js';
import {Format} from './format.js';

const trueValues = ['true', 't', 'yes', 'y', '1'];
const falseValues = ['false', 'f', 'no', 'n', '0'];

export class BooleanFormat extends Format {

  parse(value: string): Nullable<boolean> {
    if (value === '')
      return true;
    // noinspection SuspiciousTypeOfGuard
    if (typeof value === 'boolean')
      return value;
    if (trueValues.includes(value.toLowerCase()))
      return true;
    if (falseValues.includes(value.toLowerCase()))
      return false;
    throw new ValidationError(`"${value}" is not a valid boolean`);
  }

  stringify(value: any): string {
    return typeof value === 'boolean' ?
      (value ? 'true' : 'false') : '';
  }
}
