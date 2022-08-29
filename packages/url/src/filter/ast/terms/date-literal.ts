import {DateTime} from 'luxon';
import {ValidationError} from '../../../errors.js';
import {quoteFilterString} from '../../../utils/string-utils.js';
import {Literal} from '../abstract/literal.js';

const DATE_PATTERN = /^(\d{4})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)/;

export class DateLiteral extends Literal {
  value: string;

  constructor(value: string | Date) {
    super('');
    if (value instanceof Date) {
      this.value = value.toISOString();
      return;
    }
    // noinspection SuspiciousTypeOfGuard
    if (typeof value === 'string' && DATE_PATTERN.test(value) && DateTime.fromISO(value).isValid) {
      this.value = value;
      return;
    }
    throw new ValidationError(`Invalid date value "${value}"`);
  }

  toString(): string {
    return quoteFilterString(this.value);
  }

}
