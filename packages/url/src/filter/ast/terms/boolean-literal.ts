import {Literal} from '../abstract/literal';

export class BooleanLiteral extends Literal {
  value!: boolean;

  constructor(value: boolean) {
    super(value);
  }

}
