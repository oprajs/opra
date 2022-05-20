import {Literal} from '../abstract/literal';

export class BooleanLiteral extends Literal {
  value: boolean = false;

  constructor(value: boolean) {
    super(value);
  }

}
