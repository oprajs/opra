import { Expression } from '../abstract/expression.js';
import { Term } from '../abstract/term.js';

export class ArrayExpression extends Term {
  constructor(public items: Expression[]) {
    super();
  }

  toString(): string {
    return '[' + this.items.map(child => '' + child).join(',') + ']';
  }
}
