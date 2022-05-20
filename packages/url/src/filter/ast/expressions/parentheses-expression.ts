import {Expression} from '../abstract/expression';

export class ParenthesesExpression extends Expression {
  expression!: Expression;

  constructor(expression: Expression) {
    super();
    this.expression = expression;
  }

  toString(): string {
    return `(${this.expression})`;
  }

}
