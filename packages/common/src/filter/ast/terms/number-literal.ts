import { FilterValidationError } from '../../errors.js';
import { Literal } from '../abstract/literal.js';

export class NumberLiteral extends Literal {
  value: number | bigint;

  constructor(value: number | bigint | string) {
    super(0);
    if (typeof value === 'number' || typeof value === 'bigint') {
      this.value = value;
      return;
    }
    try {
      // noinspection SuspiciousTypeOfGuard
      if (typeof value === 'string') {
        if (value.includes('.')) {
          this.value = parseFloat(value);
          return;
        }
        const n = Number(value);
        if ('' + n === value) this.value = n;
        else this.value = BigInt(value);
        return;
      }
    } catch {
      //
    }
    throw new FilterValidationError(`Invalid number literal ${value}`);
  }

  toString(): string {
    return typeof this.value === 'bigint'
      ? ('' + this.value).replace(/n$/, '')
      : '' + this.value;
  }
}
