import {Literal} from '../abstract/literal';

export class NullLiteral extends Literal {
  value: null = null;
  constructor() {
    super(null);
  }
}
