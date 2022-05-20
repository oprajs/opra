import {Expression} from '../abstract/expression';
import {Term} from '../abstract/term';

export class ArrayExpression extends Term {

  constructor(public items: Expression[]) {
    super();
  }

  toString(): string {
    return '[' + this.items.map(child => '' + child).join(',') + ']';
  }

}
