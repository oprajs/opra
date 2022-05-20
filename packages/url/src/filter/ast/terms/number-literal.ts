import {ValidationError} from '../../../errors';
import {Literal} from '../abstract/literal';

export class NumberLiteral extends Literal {
  value: number | bigint = 0;

  constructor(value: number | bigint | string) {
    super(0);
    if (typeof value === 'number' || typeof value === 'bigint') {
      this.value = value;
      return;
    }
    // noinspection SuspiciousTypeOfGuard
    if (typeof value === 'string') {
      if (value.includes('.')) {
        this.value = parseFloat(value);
        return;
      }
      const n = BigInt(value);
      if (n < Number.MAX_SAFE_INTEGER)
        this.value = Number(n);
      else this.value = n;
      return;
    }
    throw new ValidationError(`Invalid number literal ${value}`);
  }

  toString(): string {
    return typeof this.value === 'bigint'
      ? ('' + this.value).replace(/n$/, '')
      : ('' + this.value);
  }

}
