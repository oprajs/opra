// Generated from src/filter/antlr/OpraFilter.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { TermExpressionContext } from "./OpraFilterParser";
import { PolarityExpressionContext } from "./OpraFilterParser";
import { ArithmeticExpressionContext } from "./OpraFilterParser";
import { ComparisonExpressionContext } from "./OpraFilterParser";
import { LogicalExpressionContext } from "./OpraFilterParser";
import { ParenthesizedExpressionContext } from "./OpraFilterParser";
import { ArrayExpressionContext } from "./OpraFilterParser";
import { MemberIndexContext } from "./OpraFilterParser";
import { NumberIndexContext } from "./OpraFilterParser";
import { NumberLiteralContext } from "./OpraFilterParser";
import { InfinityLiteralContext } from "./OpraFilterParser";
import { BooleanLiteralContext } from "./OpraFilterParser";
import { NullLiteralContext } from "./OpraFilterParser";
import { DateLiteralContext } from "./OpraFilterParser";
import { DateTimeLiteralContext } from "./OpraFilterParser";
import { TimeLiteralContext } from "./OpraFilterParser";
import { StringLiteralContext } from "./OpraFilterParser";
import { MemberInvocationContext } from "./OpraFilterParser";
import { LiteralTermContext } from "./OpraFilterParser";
import { QualifiedIdentifierTermContext } from "./OpraFilterParser";
import { ExternalConstantTermContext } from "./OpraFilterParser";
import { RootContext } from "./OpraFilterParser";
import { ExpressionContext } from "./OpraFilterParser";
import { TermContext } from "./OpraFilterParser";
import { InvocableContext } from "./OpraFilterParser";
import { InvocationContext } from "./OpraFilterParser";
import { IndexerContext } from "./OpraFilterParser";
import { FunctionContext } from "./OpraFilterParser";
import { ParamListContext } from "./OpraFilterParser";
import { UnitContext } from "./OpraFilterParser";
import { DateTimePrecisionContext } from "./OpraFilterParser";
import { PluralDateTimePrecisionContext } from "./OpraFilterParser";
import { QualifiedIdentifierContext } from "./OpraFilterParser";
import { ExternalConstantContext } from "./OpraFilterParser";
import { IdentifierContext } from "./OpraFilterParser";
import { LiteralContext } from "./OpraFilterParser";
import { CompOpContext } from "./OpraFilterParser";
import { ArthOpContext } from "./OpraFilterParser";
import { PolarOpContext } from "./OpraFilterParser";
import { LogOpContext } from "./OpraFilterParser";
import { BooleanContext } from "./OpraFilterParser";
import { NullContext } from "./OpraFilterParser";
import { InfinityContext } from "./OpraFilterParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `OpraFilterParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface OpraFilterVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `termExpression`
	 * labeled alternative in `OpraFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTermExpression?: (ctx: TermExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `polarityExpression`
	 * labeled alternative in `OpraFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPolarityExpression?: (ctx: PolarityExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `arithmeticExpression`
	 * labeled alternative in `OpraFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArithmeticExpression?: (ctx: ArithmeticExpressionContext) => Result;

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
	 * Visit a parse tree produced by the `parenthesizedExpression`
	 * labeled alternative in `OpraFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParenthesizedExpression?: (ctx: ParenthesizedExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `arrayExpression`
	 * labeled alternative in `OpraFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArrayExpression?: (ctx: ArrayExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `memberIndex`
	 * labeled alternative in `OpraFilterParser.indexer`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMemberIndex?: (ctx: MemberIndexContext) => Result;

	/**
	 * Visit a parse tree produced by the `numberIndex`
	 * labeled alternative in `OpraFilterParser.indexer`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumberIndex?: (ctx: NumberIndexContext) => Result;

	/**
	 * Visit a parse tree produced by the `numberLiteral`
	 * labeled alternative in `OpraFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumberLiteral?: (ctx: NumberLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `infinityLiteral`
	 * labeled alternative in `OpraFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInfinityLiteral?: (ctx: InfinityLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `booleanLiteral`
	 * labeled alternative in `OpraFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBooleanLiteral?: (ctx: BooleanLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `nullLiteral`
	 * labeled alternative in `OpraFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNullLiteral?: (ctx: NullLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `dateLiteral`
	 * labeled alternative in `OpraFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDateLiteral?: (ctx: DateLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `dateTimeLiteral`
	 * labeled alternative in `OpraFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDateTimeLiteral?: (ctx: DateTimeLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `timeLiteral`
	 * labeled alternative in `OpraFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTimeLiteral?: (ctx: TimeLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `stringLiteral`
	 * labeled alternative in `OpraFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStringLiteral?: (ctx: StringLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `memberInvocation`
	 * labeled alternative in `OpraFilterParser.invocation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMemberInvocation?: (ctx: MemberInvocationContext) => Result;

	/**
	 * Visit a parse tree produced by the `literalTerm`
	 * labeled alternative in `OpraFilterParser.term`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteralTerm?: (ctx: LiteralTermContext) => Result;

	/**
	 * Visit a parse tree produced by the `qualifiedIdentifierTerm`
	 * labeled alternative in `OpraFilterParser.term`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQualifiedIdentifierTerm?: (ctx: QualifiedIdentifierTermContext) => Result;

	/**
	 * Visit a parse tree produced by the `externalConstantTerm`
	 * labeled alternative in `OpraFilterParser.term`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExternalConstantTerm?: (ctx: ExternalConstantTermContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.root`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRoot?: (ctx: RootContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.term`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTerm?: (ctx: TermContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.invocable`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInvocable?: (ctx: InvocableContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.invocation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInvocation?: (ctx: InvocationContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.indexer`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIndexer?: (ctx: IndexerContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.function`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunction?: (ctx: FunctionContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.paramList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParamList?: (ctx: ParamListContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnit?: (ctx: UnitContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.dateTimePrecision`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDateTimePrecision?: (ctx: DateTimePrecisionContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.pluralDateTimePrecision`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPluralDateTimePrecision?: (ctx: PluralDateTimePrecisionContext) => Result;

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
	 * Visit a parse tree produced by `OpraFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteral?: (ctx: LiteralContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.compOp`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCompOp?: (ctx: CompOpContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.arthOp`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArthOp?: (ctx: ArthOpContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.polarOp`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPolarOp?: (ctx: PolarOpContext) => Result;

	/**
	 * Visit a parse tree produced by `OpraFilterParser.logOp`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLogOp?: (ctx: LogOpContext) => Result;

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
}

