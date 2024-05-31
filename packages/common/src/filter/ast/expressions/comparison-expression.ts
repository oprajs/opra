import { StrictOmit } from 'ts-gems';
import { Expression } from '../abstract/expression.js';

export type ComparisonOperator =
  | '<='
  | '<'
  | '>'
  | '>='
  | '='
  | '!='
  | 'in'
  | '!in'
  | 'like'
  | '!like'
  | 'ilike'
  | '!ilike';
const WORD_PATTERN = /\w/;

export class ComparisonExpression extends Expression {
  op!: ComparisonOperator;
  left!: Expression;
  right!: Expression;

  constructor(o: StrictOmit<ComparisonExpression, 'kind'>) {
    super();
    Object.assign(this, o);
  }

  toString(): string {
    return `${this.left}${WORD_PATTERN.test(this.op) ? ' ' + this.op + ' ' : this.op}${this.right}`;
  }
}
