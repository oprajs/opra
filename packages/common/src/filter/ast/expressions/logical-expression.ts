import { Expression } from '../abstract/expression.js';

export type LogicalOperator = 'and' | 'or';

export class LogicalExpression extends Expression {
  op!: LogicalOperator;
  items!: Expression[];

  constructor(o: Omit<LogicalExpression, 'kind'>) {
    super();
    Object.assign(this, o);
    if ((this.op as string) === '&&') this.op = 'and';
    if ((this.op as string) === '||') this.op = 'or';
  }

  toString(): string {
    return this.items.map(child => '' + child).join(' ' + this.op + ' ');
  }
}
