import {Expression} from '../abstract/expression';
import {Parenthesized} from '../abstract/parenthesized';

export type ArithmeticOperator = '+' | '-' | '*' | '/';

export class ArithmeticExpression extends Expression {
  items: ArithmeticExpressionItem[] = [];

  constructor() {
    super();
  }

  addItem(op: ArithmeticOperator, expression: Expression): this {
    this.items.push(new ArithmeticExpressionItem({
      op,
      expression
    }));
    return this;
  }

  toString(): string {
    return this.items.map(
      (child, i) =>
        (child.expression instanceof Parenthesized ? '(' : '') +
        (i > 0 ? child.op : '') + child.expression +
        (child.expression instanceof Parenthesized ? ')' : '')
    ).join('');
  }

}

export class ArithmeticExpressionItem {
  op!: ArithmeticOperator;
  expression!: Expression;

  constructor(o: Omit<ArithmeticExpressionItem, 'type'>) {
    Object.assign(this, o);
  }

}
