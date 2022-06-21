import {Literal} from '../abstract/literal';

export class BooleanLiteral extends Literal {
  declare value: boolean;

  constructor(value: boolean) {
    super(value);
  }

}
