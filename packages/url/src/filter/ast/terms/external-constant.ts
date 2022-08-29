import {Literal} from '../abstract/literal.js';

export class ExternalConstant extends Literal {
  constructor(value: string) {
    super('' + value);
  }

  toString(): string {
    return '@' + super.toString();
  }
}
