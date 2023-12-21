import { toDateDef } from 'putil-varhelpers';
import { FilterValidationError } from '../../errors.js';
import { quoteFilterString } from '../../utils.js';
import { Literal } from '../abstract/literal.js';

// const DATE_PATTERN = /^(\d{4})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)/;
const NullDate = new Date(0);

export class DateLiteral extends Literal {
  value: string;

  constructor(value: string | Date) {
    super('');
    if (value instanceof Date) {
      this.value = value.toISOString();
      return;
    }
    // noinspection SuspiciousTypeOfGuard
    if (typeof value === 'string' && toDateDef(value, NullDate) !== NullDate) {
      this.value = value;
      return;
    }
    throw new FilterValidationError(`Invalid date value "${value}"`);
  }

  toString(): string {
    return quoteFilterString(this.value);
  }

}
