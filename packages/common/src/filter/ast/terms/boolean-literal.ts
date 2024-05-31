import { Literal } from '../abstract/literal.js';

export class BooleanLiteral extends Literal {
  declare value: boolean;

  constructor(value: boolean) {
    super(value);
  }
}
