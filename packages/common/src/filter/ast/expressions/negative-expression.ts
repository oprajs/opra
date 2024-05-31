import { Expression } from '../abstract/expression.js';

export class NegativeExpression extends Expression {
  expression!: Expression;

  constructor(expression: Expression) {
    super();
    this.expression = expression;
  }

  toString(): string {
    return `(${this.expression})`;
  }
}
