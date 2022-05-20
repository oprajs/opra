import {ValidationError} from '../errors';
import {Nullable} from '../types';
import {Format} from './format';

const trueValues = ['true', 't', 'yes', 'y', '1'];
const falseValues = ['false', 'f', 'no', 'n', '0'];

export class BooleanFormat extends Format {

  parse(value: string, key: string): Nullable<boolean> {
    if (value == null || value === '')
      return undefined;
    if (trueValues.includes(value.toLowerCase()))
      return true;
    if (falseValues.includes(value.toLowerCase()))
      return false;
    throw new ValidationError(`Invalid boolean value in "${key}"`);
  }

  stringify(value: any): string {
    return value ? 'true' : 'false';
  }
}
