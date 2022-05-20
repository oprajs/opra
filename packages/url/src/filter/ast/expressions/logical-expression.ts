import {Expression} from '../abstract/expression';
import {Parenthesized} from '../abstract/parenthesized';

export type LogicalOperator = 'and' | 'or';

export class LogicalExpression extends Parenthesized {
  op!: LogicalOperator;
  items!: Expression[];

  constructor(o: Omit<LogicalExpression, 'type'>) {
    super();
    Object.assign(this, o);
  }

  toString(): string {
    return this.items
      .map(child =>
        (child instanceof Parenthesized ? '(' : '') +
        child +
        (child instanceof Parenthesized ? ')' : '')
      )
      .join(' ' + this.op + ' ');
  }

}
