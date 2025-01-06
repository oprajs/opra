import { Expression } from '../abstract/expression.js';

export type ArithmeticOperator = '+' | '-' | '*' | '/';

export class ArithmeticExpression extends Expression {
  items: ArithmeticExpressionItem[] = [];

  constructor() {
    super();
  }

  append(op: ArithmeticOperator, expression: Expression): this {
    this.items.push(
      new ArithmeticExpressionItem({
        op,
        expression,
      }),
    );
    return this;
  }

  toString(): string {
    return this.items
      .map((child, i) => (i > 0 ? child.op : '') + child.expression)
      .join('');
  }
}

export class ArithmeticExpressionItem {
  op!: ArithmeticOperator;
  expression!: Expression;

  constructor(o: ArithmeticExpressionItem) {
    Object.assign(this, o);
  }
}
