import { toDateDef } from 'putil-varhelpers';
import { FilterValidationError } from '../../errors.js';
import { quoteFilterString } from '../../utils.js';
import { Literal } from '../abstract/literal.js';

const NullDate = new Date(0);

export class DateTimeLiteral extends Literal {
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
    throw new FilterValidationError(`Invalid date-time value "${value}"`);
  }

  toString(): string {
    return quoteFilterString(this.value);
  }
}
