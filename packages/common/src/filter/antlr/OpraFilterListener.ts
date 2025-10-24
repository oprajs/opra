// Generated from ./src/filter/antlr/OpraFilter.g4 by ANTLR 4.13.2

import { ParseTreeListener } from '@browsery/antlr4';

import type { RootContext } from './OpraFilterParser.js';
import type { ParenthesizedExpressionContext } from './OpraFilterParser.js';
import type { NegativeExpressionContext } from './OpraFilterParser.js';
import type { ComparisonExpressionContext } from './OpraFilterParser.js';
import type { LogicalExpressionContext } from './OpraFilterParser.js';
import type { ComparisonLeftContext } from './OpraFilterParser.js';
import type { ComparisonRightContext } from './OpraFilterParser.js';
import type { ParenthesizedItemContext } from './OpraFilterParser.js';
import type { NumberLiteralContext } from './OpraFilterParser.js';
import type { InfinityLiteralContext } from './OpraFilterParser.js';
import type { BooleanLiteralContext } from './OpraFilterParser.js';
import type { NullLiteralContext } from './OpraFilterParser.js';
import type { DateTimeLiteralContext } from './OpraFilterParser.js';
import type { DateLiteralContext } from './OpraFilterParser.js';
import type { TimeLiteralContext } from './OpraFilterParser.js';
import { type StringLiteralContext } from './OpraFilterParser.js';
import type { QualifiedIdentifierContext } from './OpraFilterParser.js';
import type { ExternalConstantContext } from './OpraFilterParser.js';
import type { IdentifierContext } from './OpraFilterParser.js';
import type { ArrayValueContext } from './OpraFilterParser.js';
import type { BooleanContext } from './OpraFilterParser.js';
import type { NullContext } from './OpraFilterParser.js';
import type { InfinityContext } from './OpraFilterParser.js';
import type { ArithmeticOperatorContext } from './OpraFilterParser.js';
import type { ComparisonOperatorContext } from './OpraFilterParser.js';
import type { LogicalOperatorContext } from './OpraFilterParser.js';
import type { PolarityOperatorContext } from './OpraFilterParser.js';

/**
 * This interface defines a complete listener for a parse tree produced by
 * `OpraFilterParser`.
 */
export default class OpraFilterListener extends ParseTreeListener {
  /**
   * Enter a parse tree produced by `OpraFilterParser.root`.
   * @param ctx the parse tree
   */
  enterRoot?: (ctx: RootContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.root`.
   * @param ctx the parse tree
   */
  exitRoot?: (ctx: RootContext) => void;
  /**
   * Enter a parse tree produced by the `parenthesizedExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  enterParenthesizedExpression?: (ctx: ParenthesizedExpressionContext) => void;
  /**
   * Exit a parse tree produced by the `parenthesizedExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  exitParenthesizedExpression?: (ctx: ParenthesizedExpressionContext) => void;
  /**
   * Enter a parse tree produced by the `negativeExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  enterNegativeExpression?: (ctx: NegativeExpressionContext) => void;
  /**
   * Exit a parse tree produced by the `negativeExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  exitNegativeExpression?: (ctx: NegativeExpressionContext) => void;
  /**
   * Enter a parse tree produced by the `comparisonExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  enterComparisonExpression?: (ctx: ComparisonExpressionContext) => void;
  /**
   * Exit a parse tree produced by the `comparisonExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  exitComparisonExpression?: (ctx: ComparisonExpressionContext) => void;
  /**
   * Enter a parse tree produced by the `logicalExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  enterLogicalExpression?: (ctx: LogicalExpressionContext) => void;
  /**
   * Exit a parse tree produced by the `logicalExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  exitLogicalExpression?: (ctx: LogicalExpressionContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.comparisonLeft`.
   * @param ctx the parse tree
   */
  enterComparisonLeft?: (ctx: ComparisonLeftContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.comparisonLeft`.
   * @param ctx the parse tree
   */
  exitComparisonLeft?: (ctx: ComparisonLeftContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.comparisonRight`.
   * @param ctx the parse tree
   */
  enterComparisonRight?: (ctx: ComparisonRightContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.comparisonRight`.
   * @param ctx the parse tree
   */
  exitComparisonRight?: (ctx: ComparisonRightContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.parenthesizedItem`.
   * @param ctx the parse tree
   */
  enterParenthesizedItem?: (ctx: ParenthesizedItemContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.parenthesizedItem`.
   * @param ctx the parse tree
   */
  exitParenthesizedItem?: (ctx: ParenthesizedItemContext) => void;
  /**
   * Enter a parse tree produced by the `numberLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  enterNumberLiteral?: (ctx: NumberLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `numberLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  exitNumberLiteral?: (ctx: NumberLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `infinityLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  enterInfinityLiteral?: (ctx: InfinityLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `infinityLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  exitInfinityLiteral?: (ctx: InfinityLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `booleanLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  enterBooleanLiteral?: (ctx: BooleanLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `booleanLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  exitBooleanLiteral?: (ctx: BooleanLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `nullLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  enterNullLiteral?: (ctx: NullLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `nullLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  exitNullLiteral?: (ctx: NullLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `dateTimeLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  enterDateTimeLiteral?: (ctx: DateTimeLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `dateTimeLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  exitDateTimeLiteral?: (ctx: DateTimeLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `dateLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  enterDateLiteral?: (ctx: DateLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `dateLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  exitDateLiteral?: (ctx: DateLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `timeLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  enterTimeLiteral?: (ctx: TimeLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `timeLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  exitTimeLiteral?: (ctx: TimeLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `stringLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  enterStringLiteral?: (ctx: StringLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `stringLiteral`
   * labeled alternative in `OpraFilterParser.value`.
   * @param ctx the parse tree
   */
  exitStringLiteral?: (ctx: StringLiteralContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.qualifiedIdentifier`.
   * @param ctx the parse tree
   */
  enterQualifiedIdentifier?: (ctx: QualifiedIdentifierContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.qualifiedIdentifier`.
   * @param ctx the parse tree
   */
  exitQualifiedIdentifier?: (ctx: QualifiedIdentifierContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.externalConstant`.
   * @param ctx the parse tree
   */
  enterExternalConstant?: (ctx: ExternalConstantContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.externalConstant`.
   * @param ctx the parse tree
   */
  exitExternalConstant?: (ctx: ExternalConstantContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.identifier`.
   * @param ctx the parse tree
   */
  enterIdentifier?: (ctx: IdentifierContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.identifier`.
   * @param ctx the parse tree
   */
  exitIdentifier?: (ctx: IdentifierContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.arrayValue`.
   * @param ctx the parse tree
   */
  enterArrayValue?: (ctx: ArrayValueContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.arrayValue`.
   * @param ctx the parse tree
   */
  exitArrayValue?: (ctx: ArrayValueContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.boolean`.
   * @param ctx the parse tree
   */
  enterBoolean?: (ctx: BooleanContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.boolean`.
   * @param ctx the parse tree
   */
  exitBoolean?: (ctx: BooleanContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.null`.
   * @param ctx the parse tree
   */
  enterNull?: (ctx: NullContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.null`.
   * @param ctx the parse tree
   */
  exitNull?: (ctx: NullContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.infinity`.
   * @param ctx the parse tree
   */
  enterInfinity?: (ctx: InfinityContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.infinity`.
   * @param ctx the parse tree
   */
  exitInfinity?: (ctx: InfinityContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.arithmeticOperator`.
   * @param ctx the parse tree
   */
  enterArithmeticOperator?: (ctx: ArithmeticOperatorContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.arithmeticOperator`.
   * @param ctx the parse tree
   */
  exitArithmeticOperator?: (ctx: ArithmeticOperatorContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.comparisonOperator`.
   * @param ctx the parse tree
   */
  enterComparisonOperator?: (ctx: ComparisonOperatorContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.comparisonOperator`.
   * @param ctx the parse tree
   */
  exitComparisonOperator?: (ctx: ComparisonOperatorContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.logicalOperator`.
   * @param ctx the parse tree
   */
  enterLogicalOperator?: (ctx: LogicalOperatorContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.logicalOperator`.
   * @param ctx the parse tree
   */
  exitLogicalOperator?: (ctx: LogicalOperatorContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.polarityOperator`.
   * @param ctx the parse tree
   */
  enterPolarityOperator?: (ctx: PolarityOperatorContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.polarityOperator`.
   * @param ctx the parse tree
   */
  exitPolarityOperator?: (ctx: PolarityOperatorContext) => void;
}
