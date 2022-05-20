import {ValidationError} from '../../../errors';
import {quoteString} from '../../../utils/string-utils';
import {Literal} from '../abstract/literal';

const TIME_PATTERN = /^([01][\\d]|2[0-3]):([0-5][\\d])(:[0-5][\\d])?(\.(\d+))?$/;

export class TimeLiteral extends Literal {
  value: string;

  constructor(value: string | Date) {
    super('');
    if (value instanceof Date) {
      this.value = value.getHours() + ':' + value.getMinutes() +
        (value.getSeconds() ? ':' + value.getSeconds() : '') +
        (value.getMilliseconds() ? '.' + value.getMilliseconds() : '');
      return;
    }
    // noinspection SuspiciousTypeOfGuard
    if (typeof value === 'string' && TIME_PATTERN.test(value))
      this.value = value;
    throw new ValidationError(`Invalid time value "${value}"`);
  }

  toString(): string {
    return quoteString(this.value);
  }

}
