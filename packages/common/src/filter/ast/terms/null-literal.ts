import { Literal } from '../abstract/literal.js';

export class NullLiteral extends Literal {
  value: null = null;

  constructor() {
    super(null);
  }
}
