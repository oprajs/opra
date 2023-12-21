import { FilterValidationError } from '../../errors.js';
import { quoteFilterString } from '../../utils.js';
import { Literal } from '../abstract/literal.js';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?(\.(\d+))?$/;

export class TimeLiteral extends Literal {
  value: string;

  constructor(value: string | Date) {
    super('');
    if (value instanceof Date) {
      this.value = pad(value.getHours()) + ':' +
          pad(value.getMinutes()) +
          (value.getSeconds() ? ':' + pad(value.getSeconds()) : '') +
          (value.getMilliseconds() ? '.' + pad(value.getMilliseconds()) : '');
      return;
    }
    // noinspection SuspiciousTypeOfGuard
    if (typeof value === 'string' && TIME_PATTERN.test(value)) {
      this.value = value;
      return;
    }
    throw new FilterValidationError(`Invalid time value "${value}"`);
  }

  toString(): string {
    return quoteFilterString(this.value);
  }

}

function pad(n: number): string {
  return n <= 9 ? '0' + n : '' + n;
}
