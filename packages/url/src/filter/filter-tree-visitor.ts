import {AbstractParseTreeVisitor} from 'antlr4ts/tree';
import {SyntaxError} from '../errors';
import {unquoteFilterString} from '../utils/string-utils';
import {
  ArithmeticExpressionContext, ArrayExpressionContext,
  BooleanLiteralContext,
  ComparisonExpressionContext,
  DateLiteralContext,
  DateTimeLiteralContext,
  ExpressionContext,
  ExternalConstantTermContext,
  IdentifierContext,
  LogicalExpressionContext,
  NumberLiteralContext, ParenthesizedExpressionContext,
  PolarityExpressionContext,
  QualifiedIdentifierTermContext,
  RootContext,
  StringLiteralContext,
  TimeLiteralContext,
} from './antlr/OWOFilterParser';
import {OWOFilterVisitor} from './antlr/OWOFilterVisitor';
import {
  ArithmeticExpression, ArithmeticOperator,
  ArrayExpression,
  BooleanLiteral, ComparisonExpression, ComparisonOperator,
  DateLiteral, LogicalExpression, LogicalOperator,
  NullLiteral,
  NumberLiteral, ParenthesesExpression,
  QualifiedIdentifier,
  StringLiteral,
  TimeLiteral
} from './ast';
import {ExternalConstant} from './ast/terms/external-constant';

export class FilterTreeVisitor extends AbstractParseTreeVisitor<any> implements OWOFilterVisitor<any> {
  private _timeZone?: string;

  constructor(options?: {
    timeZone?: string
  }) {
    super();
    this._timeZone = options?.timeZone;
  }

  protected defaultResult(): any {
    return undefined;
  }

  visitRoot(ctx: RootContext) {
    return this.visit(ctx.expression());
  }

  visitIdentifier(ctx: IdentifierContext) {
    return ctx.text;
  }

  visitNullLiteral() {
    return new NullLiteral();
  }

  visitBooleanLiteral(ctx: BooleanLiteralContext) {
    return new BooleanLiteral(ctx.text === 'true');
  }

  visitNumberLiteral(ctx: NumberLiteralContext) {
    return new NumberLiteral(ctx.text);
  }

  visitStringLiteral(ctx: StringLiteralContext) {
    return new StringLiteral(unquoteFilterString(ctx.text));
  }

  visitInfinityLiteral() {
    return new NumberLiteral(Infinity);
  }

  visitDateLiteral(ctx: DateLiteralContext) {
    return new DateLiteral(unquoteFilterString(ctx.text));
  }

  visitDateTimeLiteral(ctx: DateTimeLiteralContext) {
    return new DateLiteral(unquoteFilterString(ctx.text));
  }

  visitTimeLiteral(ctx: TimeLiteralContext) {
    return new TimeLiteral(unquoteFilterString(ctx.text));
  }

  visitQualifiedIdentifierTerm(ctx: QualifiedIdentifierTermContext) {
    return new QualifiedIdentifier(ctx.text);
  }

  visitPolarityExpression(ctx: PolarityExpressionContext) {
    const x = this.visit(ctx.expression());
    if (x.type === 'NumberLiteral') {
      if (ctx.polarOp().text === '-')
        x.value *= -1;
      return x;
    }
    throw new SyntaxError('Unexpected token "' + ctx.text + '"');
  }

  visitExternalConstantTerm(ctx: ExternalConstantTermContext) {
    return new ExternalConstant(ctx.externalConstant().text.substring(1));
  }

  visitParenthesizedExpression(ctx: ParenthesizedExpressionContext) {
    const expression = this.visit(ctx.expression());
    return new ParenthesesExpression(expression);
  }

  visitArrayExpression(ctx: ArrayExpressionContext) {
    return new ArrayExpression(ctx.expression().map(child => this.visit(child)));
  }

  visitComparisonExpression(ctx: ComparisonExpressionContext): any {
    return new ComparisonExpression({
      op: ctx.compOp().text as ComparisonOperator,
      left: this.visit(ctx.expression(0)),
      right: this.visit(ctx.expression(1))
    })
  }

  visitLogicalExpression(ctx: LogicalExpressionContext) {
    const items: any[] = [];
    const wrapChildren = (arr: ExpressionContext[], op: string) => {
      for (const c of arr) {
        if (c instanceof LogicalExpressionContext && c.logOp().text === op) {
          wrapChildren(c.expression(), c.logOp().text);
          continue;
        }
        const o = this.visit(c);
        items.push(o);
      }
    }
    wrapChildren(ctx.expression(), ctx.logOp().text);
    return new LogicalExpression({
      op: ctx.logOp().text as LogicalOperator,
      items
    })
  }

  visitArithmeticExpression(ctx: ArithmeticExpressionContext) {
    const exp = new ArithmeticExpression();
    const wrapChildren = (children: ExpressionContext[], op: string) => {
      for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i];
        if (child instanceof ArithmeticExpressionContext) {
          wrapChildren(child.expression(), child.arthOp().text);
          continue;
        }
        const value = this.visit(child);
        exp.append(op as ArithmeticOperator || '+', value);
      }
    }
    wrapChildren(ctx.expression(), ctx.arthOp().text);
    return exp;
  }


}

