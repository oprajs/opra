import {Literal} from '../abstract/literal';

export class ExternalConstant extends Literal {
  constructor(value: string) {
    super('' + value);
  }

  toString(): string {
    return '@' + super.toString();
  }
}
