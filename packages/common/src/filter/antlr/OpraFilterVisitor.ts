// Generated from ./src/filter/antlr/OpraFilter.g4 by ANTLR 4.13.2

import {ParseTreeVisitor} from '@browsery/antlr4';


import type { RootContext } from "./OpraFilterParser.js";
import type { ParenthesizedExpressionContext } from "./OpraFilterParser.js";
import type { NegativeExpressionContext } from "./OpraFilterParser.js";
import type { ComparisonExpressionContext } from "./OpraFilterParser.js";
import type { LogicalExpressionContext } from "./OpraFilterParser.js";
import type { ComparisonLeftContext } from "./OpraFilterParser.js";
import type { ComparisonRightContext } from "./OpraFilterParser.js";
import type { ParenthesizedItemContext } from "./OpraFilterParser.js";
import type { NumberLiteralContext } from "./OpraFilterParser.js";
import type { InfinityLiteralContext } from "./OpraFilterParser.js";
import type { BooleanLiteralContext } from "./OpraFilterParser.js";
import type { NullLiteralContext } from "./OpraFilterParser.js";
import type { DateTimeLiteralContext } from "./OpraFilterParser.js";
import type { DateLiteralContext } from "./OpraFilterParser.js";
import type { TimeLiteralContext } from "./OpraFilterParser.js";
import type { StringLiteralContext } from "./OpraFilterParser.js";
import type { QualifiedIdentifierContext } from "./OpraFilterParser.js";
import type { ExternalConstantContext } from "./OpraFilterParser.js";
import type { IdentifierContext } from "./OpraFilterParser.js";
import type { ArrayValueContext } from "./OpraFilterParser.js";
import type { BooleanContext } from "./OpraFilterParser.js";
import type { NullContext } from "./OpraFilterParser.js";
import type { InfinityContext } from "./OpraFilterParser.js";
import type { ArithmeticOperatorContext } from "./OpraFilterParser.js";
import type { ComparisonOperatorContext } from "./OpraFilterParser.js";
import type { LogicalOperatorContext } from "./OpraFilterParser.js";
import type { PolarityOperatorContext } from "./OpraFilterParser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `OpraFilterParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class OpraFilterVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `OpraFilterParser.root`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRoot?: (ctx: RootContext) => Result;
	/**
	 * Visit a parse tree produced by the `parenthesizedExpression`
	 * labeled alternative in `OpraFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParenthesizedExpression?: (ctx: ParenthesizedExpressionContext) => Result;
	/**
	 * Visit a parse tree produced by the `negativeExpression`
	 * labeled alternative in `OpraFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNegativeExpression?: (ctx: NegativeExpressionContext) => Result;
	/**
	 * Visit a parse tree produced by the `comparisonExpression`
	 * labeled alternative in `OpraFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComparisonExpression?: (ctx: ComparisonExpressionContext) => Result;
	/**
	 * Visit a parse tree produced by the `logicalExpression`
	 * labeled alternative in `OpraFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLogicalExpression?: (ctx: LogicalExpressionContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.comparisonLeft`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComparisonLeft?: (ctx: ComparisonLeftContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.comparisonRight`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComparisonRight?: (ctx: ComparisonRightContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.parenthesizedItem`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParenthesizedItem?: (ctx: ParenthesizedItemContext) => Result;
	/**
	 * Visit a parse tree produced by the `numberLiteral`
	 * labeled alternative in `OpraFilterParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumberLiteral?: (ctx: NumberLiteralContext) => Result;
	/**
	 * Visit a parse tree produced by the `infinityLiteral`
	 * labeled alternative in `OpraFilterParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInfinityLiteral?: (ctx: InfinityLiteralContext) => Result;
	/**
	 * Visit a parse tree produced by the `booleanLiteral`
	 * labeled alternative in `OpraFilterParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBooleanLiteral?: (ctx: BooleanLiteralContext) => Result;
	/**
	 * Visit a parse tree produced by the `nullLiteral`
	 * labeled alternative in `OpraFilterParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNullLiteral?: (ctx: NullLiteralContext) => Result;
	/**
	 * Visit a parse tree produced by the `dateTimeLiteral`
	 * labeled alternative in `OpraFilterParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDateTimeLiteral?: (ctx: DateTimeLiteralContext) => Result;
	/**
	 * Visit a parse tree produced by the `dateLiteral`
	 * labeled alternative in `OpraFilterParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDateLiteral?: (ctx: DateLiteralContext) => Result;
	/**
	 * Visit a parse tree produced by the `timeLiteral`
	 * labeled alternative in `OpraFilterParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTimeLiteral?: (ctx: TimeLiteralContext) => Result;
	/**
	 * Visit a parse tree produced by the `stringLiteral`
	 * labeled alternative in `OpraFilterParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStringLiteral?: (ctx: StringLiteralContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.qualifiedIdentifier`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQualifiedIdentifier?: (ctx: QualifiedIdentifierContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.externalConstant`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExternalConstant?: (ctx: ExternalConstantContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.identifier`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentifier?: (ctx: IdentifierContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.arrayValue`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArrayValue?: (ctx: ArrayValueContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.boolean`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBoolean?: (ctx: BooleanContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.null`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNull?: (ctx: NullContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.infinity`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInfinity?: (ctx: InfinityContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.arithmeticOperator`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArithmeticOperator?: (ctx: ArithmeticOperatorContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.comparisonOperator`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComparisonOperator?: (ctx: ComparisonOperatorContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.logicalOperator`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLogicalOperator?: (ctx: LogicalOperatorContext) => Result;
	/**
	 * Visit a parse tree produced by `OpraFilterParser.polarityOperator`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPolarityOperator?: (ctx: PolarityOperatorContext) => Result;
}

