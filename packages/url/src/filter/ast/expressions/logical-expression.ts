import {Expression} from '../abstract/expression.js';

export type LogicalOperator = 'and' | 'or';

export class LogicalExpression extends Expression {
  op!: LogicalOperator;
  items!: Expression[];

  constructor(o: Omit<LogicalExpression, 'type'>) {
    super();
    Object.assign(this, o);
  }

  toString(): string {
    return this.items
      .map(child => '' + child)
      .join(' ' + this.op + ' ');
  }

}
