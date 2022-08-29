import {quoteFilterString} from '../../../utils/string-utils.js';
import {Literal} from '../abstract/literal.js';

export class StringLiteral extends Literal {

  constructor(value: string) {
    super('' + value);
  }

  toString(): string {
    return quoteFilterString(this.value);
  }

}
