import type { ParseTreeVisitor as TParseTreeVisitor } from 'antlr4';
import antlr4 from 'antlr4';
import { RuleNode } from 'antlr4/src/antlr4/tree/RuleNode';
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
} from './antlr/OpraFilterParser.js';
import OpraFilterVisitor from './antlr/OpraFilterVisitor.js';
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
} from './ast/index.js';
import { ExternalConstant } from './ast/terms/external-constant.js';
import { SyntaxError } from './errors.js';
import { unquoteFilterString } from './utils.js';

// Fix: antlr4 d.ts files are invalid
const ParseTreeVisitor = (antlr4 as any).tree.ParseTreeVisitor as typeof TParseTreeVisitor;

export class FilterTreeVisitor extends ParseTreeVisitor<any> implements OpraFilterVisitor<any> {
  private _timeZone?: string;

  constructor(options?: {
    timeZone?: string
  }) {
    super();
    this._timeZone = options?.timeZone;
  }

  visitChildren(node: RuleNode) {
    const result = super.visitChildren(node);
    if (Array.isArray(result) && result.length < 2)
      return result[0];
    return result;
  }

  protected defaultResult(): any {
    return undefined;
  }

  visitRoot(ctx: RootContext) {
    return this.visit(ctx.expression());
  }

  visitIdentifier(ctx: IdentifierContext) {
    return ctx.getText();
  }

  visitNullLiteral() {
    return new NullLiteral();
  }

  visitBooleanLiteral(ctx: BooleanLiteralContext) {
    return new BooleanLiteral(ctx.getText() === 'true');
  }

  visitNumberLiteral(ctx: NumberLiteralContext) {
    return new NumberLiteral(ctx.getText());
  }

  visitStringLiteral(ctx: StringLiteralContext) {
    return new StringLiteral(unquoteFilterString(ctx.getText()));
  }

  visitInfinityLiteral() {
    return new NumberLiteral(Infinity);
  }

  visitDateLiteral(ctx: DateLiteralContext) {
    return new DateLiteral(unquoteFilterString(ctx.getText()));
  }

  visitDateTimeLiteral(ctx: DateTimeLiteralContext) {
    return new DateLiteral(unquoteFilterString(ctx.getText()));
  }

  visitTimeLiteral(ctx: TimeLiteralContext) {
    return new TimeLiteral(unquoteFilterString(ctx.getText()));
  }

  visitQualifiedIdentifierTerm(ctx: QualifiedIdentifierTermContext) {
    return new QualifiedIdentifier(ctx.getText());
  }

  visitPolarityExpression(ctx: PolarityExpressionContext) {
    const x = this.visit(ctx.expression());
    if (x.kind === 'NumberLiteral') {
      if (ctx.polarOp().getText() === '-')
        x.value *= -1;
      return x;
    }
    throw new SyntaxError('Unexpected token "' + ctx.getText() + '"');
  }

  visitExternalConstantTerm(ctx: ExternalConstantTermContext) {
    return new ExternalConstant(ctx.externalConstant().getText().substring(1));
  }

  visitParenthesizedExpression(ctx: ParenthesizedExpressionContext) {
    const expression = this.visit(ctx.expression());
    return new ParenthesesExpression(expression);
  }

  visitArrayExpression(ctx: ArrayExpressionContext) {
    return new ArrayExpression(ctx.expression_list().map(child => this.visit(child)));
  }

  visitComparisonExpression(ctx: ComparisonExpressionContext): any {
    return new ComparisonExpression({
      op: ctx.compOp().getText() as ComparisonOperator,
      left: this.visit(ctx.expression(0)),
      right: this.visit(ctx.expression(1))
    })
  }

  visitLogicalExpression(ctx: LogicalExpressionContext) {
    const items: any[] = [];
    const wrapChildren = (arr: ExpressionContext[], op: string) => {
      for (const c of arr) {
        if (c instanceof LogicalExpressionContext && c.logOp().getText() === op) {
          wrapChildren(c.expression_list(), c.logOp().getText());
          continue;
        }
        const o = this.visit(c);
        items.push(o);
      }
    }
    wrapChildren(ctx.expression_list(), ctx.logOp().getText());
    return new LogicalExpression({
      op: ctx.logOp().getText() as LogicalOperator,
      items
    })
  }

  visitArithmeticExpression(ctx: ArithmeticExpressionContext) {
    const exp = new ArithmeticExpression();
    const wrapChildren = (children: ExpressionContext[], op: string) => {
      for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i];
        if (child instanceof ArithmeticExpressionContext) {
          wrapChildren(child.expression_list(), child.arthOp().getText());
          continue;
        }
        const value = this.visit(child);
        exp.append(op as ArithmeticOperator || '+', value);
      }
    }
    wrapChildren(ctx.expression_list(), ctx.arthOp().getText());
    return exp;
  }

}

