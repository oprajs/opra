import { ParseTreeVisitor, type RuleNode } from '@browsery/antlr4';
import {
  ArrayValueContext,
  BooleanLiteralContext,
  ComparisonExpressionContext,
  DateLiteralContext,
  DateTimeLiteralContext,
  ExpressionContext,
  ExternalConstantContext,
  LogicalExpressionContext,
  NegativeExpressionContext,
  NumberLiteralContext,
  ParenthesizedExpressionContext,
  ParenthesizedItemContext,
  QualifiedIdentifierContext,
  RootContext,
  StringLiteralContext,
  TimeLiteralContext,
} from './antlr/OpraFilterParser.js';
import OpraFilterVisitor from './antlr/OpraFilterVisitor.js';
import {
  ArrayExpression,
  BooleanLiteral,
  ComparisonExpression,
  ComparisonOperator,
  DateLiteral,
  LogicalExpression,
  LogicalOperator,
  NegativeExpression,
  NullLiteral,
  NumberLiteral,
  ParenthesizedExpression,
  QualifiedIdentifier,
  StringLiteral,
  TimeLiteral,
} from './ast/index.js';
import { ExternalConstant } from './ast/terms/external-constant.js';
import { unquoteFilterString } from './utils.js';

export class FilterTreeVisitor extends ParseTreeVisitor<any> implements OpraFilterVisitor<any> {
  private _timeZone?: string;

  constructor(options?: { timeZone?: string }) {
    super();
    this._timeZone = options?.timeZone;
  }

  visitChildren(node: RuleNode) {
    const result = super.visitChildren(node);
    if (Array.isArray(result) && result.length < 2) return result[0];
    return result ?? node.getText();
  }

  protected defaultResult(): any {
    return undefined;
  }

  visitRoot(ctx: RootContext) {
    return this.visit(ctx.expression());
  }

  visitParenthesizedExpression(ctx: ParenthesizedExpressionContext) {
    const expression = this.visit(ctx.parenthesizedItem());
    return new ParenthesizedExpression(expression);
  }

  visitParenthesizedItem(ctx: ParenthesizedItemContext) {
    return this.visit(ctx.expression());
  }

  visitNegativeExpression(ctx: NegativeExpressionContext) {
    const expression = this.visit(ctx.expression());
    return new NegativeExpression(expression);
  }

  visitComparisonExpression(ctx: ComparisonExpressionContext): any {
    return new ComparisonExpression({
      op: ctx.comparisonOperator().getText() as ComparisonOperator,
      left: this.visit(ctx.comparisonLeft()),
      right: this.visit(ctx.comparisonRight()),
    });
  }

  visitLogicalExpression(ctx: LogicalExpressionContext) {
    const items: any[] = [];
    const wrapChildren = (arr: ExpressionContext[], op: string) => {
      for (const c of arr) {
        if (c instanceof LogicalExpressionContext && c.logicalOperator().getText() === op) {
          wrapChildren(c.expression_list(), c.logicalOperator().getText());
          continue;
        }
        const o = this.visit(c);
        items.push(o);
      }
    };
    wrapChildren(ctx.expression_list(), ctx.logicalOperator().getText());
    return new LogicalExpression({
      op: ctx.logicalOperator().getText() as LogicalOperator,
      items,
    });
  }

  visitQualifiedIdentifier(ctx: QualifiedIdentifierContext) {
    return new QualifiedIdentifier(ctx.getText());
  }

  visitExternalConstant(ctx: ExternalConstantContext) {
    return new ExternalConstant(ctx.identifier().getText());
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

  visitArrayValue(ctx: ArrayValueContext) {
    return new ArrayExpression(ctx.value_list().map(child => this.visit(child)));
  }

  //
  // visitArithmeticExpression(ctx: ArithmeticExpressionContext) {
  //   const exp = new ArithmeticExpression();
  //   const wrapChildren = (children: ExpressionContext[], op: string) => {
  //     for (let i = 0, len = children.length; i < len; i++) {
  //       const child = children[i];
  //       if (child instanceof ArithmeticExpressionContext) {
  //         wrapChildren(child.expression_list(), child.arthOp().getText());
  //         continue;
  //       }
  //       const value = this.visit(child);
  //       exp.append(op as ArithmeticOperator || '+', value);
  //     }
  //   }
  //   wrapChildren(ctx.expression_list(), ctx.arthOp().getText());
  //   return exp;
  // }
}
