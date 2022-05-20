// Generated from src/filter/antlr/OWOFilter.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { TermExpressionContext } from "./OWOFilterParser";
import { PolarityExpressionContext } from "./OWOFilterParser";
import { ArithmeticExpressionContext } from "./OWOFilterParser";
import { ComparisonExpressionContext } from "./OWOFilterParser";
import { LogicalExpressionContext } from "./OWOFilterParser";
import { ParenthesizedExpressionContext } from "./OWOFilterParser";
import { ArrayExpressionContext } from "./OWOFilterParser";
import { MemberIndexContext } from "./OWOFilterParser";
import { NumberIndexContext } from "./OWOFilterParser";
import { NumberLiteralContext } from "./OWOFilterParser";
import { InfinityLiteralContext } from "./OWOFilterParser";
import { BooleanLiteralContext } from "./OWOFilterParser";
import { NullLiteralContext } from "./OWOFilterParser";
import { DateLiteralContext } from "./OWOFilterParser";
import { DateTimeLiteralContext } from "./OWOFilterParser";
import { TimeLiteralContext } from "./OWOFilterParser";
import { StringLiteralContext } from "./OWOFilterParser";
import { MemberInvocationContext } from "./OWOFilterParser";
import { LiteralTermContext } from "./OWOFilterParser";
import { QualifiedIdentifierTermContext } from "./OWOFilterParser";
import { ExternalConstantTermContext } from "./OWOFilterParser";
import { RootContext } from "./OWOFilterParser";
import { ExpressionContext } from "./OWOFilterParser";
import { TermContext } from "./OWOFilterParser";
import { InvocableContext } from "./OWOFilterParser";
import { InvocationContext } from "./OWOFilterParser";
import { IndexerContext } from "./OWOFilterParser";
import { FunctionContext } from "./OWOFilterParser";
import { ParamListContext } from "./OWOFilterParser";
import { UnitContext } from "./OWOFilterParser";
import { DateTimePrecisionContext } from "./OWOFilterParser";
import { PluralDateTimePrecisionContext } from "./OWOFilterParser";
import { QualifiedIdentifierContext } from "./OWOFilterParser";
import { ExternalConstantContext } from "./OWOFilterParser";
import { IdentifierContext } from "./OWOFilterParser";
import { LiteralContext } from "./OWOFilterParser";
import { CompOpContext } from "./OWOFilterParser";
import { ArthOpContext } from "./OWOFilterParser";
import { PolarOpContext } from "./OWOFilterParser";
import { LogOpContext } from "./OWOFilterParser";
import { BooleanContext } from "./OWOFilterParser";
import { NullContext } from "./OWOFilterParser";
import { InfinityContext } from "./OWOFilterParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `OWOFilterParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface OWOFilterVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `termExpression`
	 * labeled alternative in `OWOFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTermExpression?: (ctx: TermExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `polarityExpression`
	 * labeled alternative in `OWOFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPolarityExpression?: (ctx: PolarityExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `arithmeticExpression`
	 * labeled alternative in `OWOFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArithmeticExpression?: (ctx: ArithmeticExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `comparisonExpression`
	 * labeled alternative in `OWOFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComparisonExpression?: (ctx: ComparisonExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `logicalExpression`
	 * labeled alternative in `OWOFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLogicalExpression?: (ctx: LogicalExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `parenthesizedExpression`
	 * labeled alternative in `OWOFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParenthesizedExpression?: (ctx: ParenthesizedExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `arrayExpression`
	 * labeled alternative in `OWOFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArrayExpression?: (ctx: ArrayExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `memberIndex`
	 * labeled alternative in `OWOFilterParser.indexer`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMemberIndex?: (ctx: MemberIndexContext) => Result;

	/**
	 * Visit a parse tree produced by the `numberIndex`
	 * labeled alternative in `OWOFilterParser.indexer`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumberIndex?: (ctx: NumberIndexContext) => Result;

	/**
	 * Visit a parse tree produced by the `numberLiteral`
	 * labeled alternative in `OWOFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumberLiteral?: (ctx: NumberLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `infinityLiteral`
	 * labeled alternative in `OWOFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInfinityLiteral?: (ctx: InfinityLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `booleanLiteral`
	 * labeled alternative in `OWOFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBooleanLiteral?: (ctx: BooleanLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `nullLiteral`
	 * labeled alternative in `OWOFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNullLiteral?: (ctx: NullLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `dateLiteral`
	 * labeled alternative in `OWOFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDateLiteral?: (ctx: DateLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `dateTimeLiteral`
	 * labeled alternative in `OWOFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDateTimeLiteral?: (ctx: DateTimeLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `timeLiteral`
	 * labeled alternative in `OWOFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTimeLiteral?: (ctx: TimeLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `stringLiteral`
	 * labeled alternative in `OWOFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStringLiteral?: (ctx: StringLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by the `memberInvocation`
	 * labeled alternative in `OWOFilterParser.invocation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMemberInvocation?: (ctx: MemberInvocationContext) => Result;

	/**
	 * Visit a parse tree produced by the `literalTerm`
	 * labeled alternative in `OWOFilterParser.term`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteralTerm?: (ctx: LiteralTermContext) => Result;

	/**
	 * Visit a parse tree produced by the `qualifiedIdentifierTerm`
	 * labeled alternative in `OWOFilterParser.term`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQualifiedIdentifierTerm?: (ctx: QualifiedIdentifierTermContext) => Result;

	/**
	 * Visit a parse tree produced by the `externalConstantTerm`
	 * labeled alternative in `OWOFilterParser.term`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExternalConstantTerm?: (ctx: ExternalConstantTermContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.root`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRoot?: (ctx: RootContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.term`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTerm?: (ctx: TermContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.invocable`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInvocable?: (ctx: InvocableContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.invocation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInvocation?: (ctx: InvocationContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.indexer`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIndexer?: (ctx: IndexerContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.function`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunction?: (ctx: FunctionContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.paramList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParamList?: (ctx: ParamListContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnit?: (ctx: UnitContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.dateTimePrecision`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDateTimePrecision?: (ctx: DateTimePrecisionContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.pluralDateTimePrecision`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPluralDateTimePrecision?: (ctx: PluralDateTimePrecisionContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.qualifiedIdentifier`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQualifiedIdentifier?: (ctx: QualifiedIdentifierContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.externalConstant`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExternalConstant?: (ctx: ExternalConstantContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.identifier`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentifier?: (ctx: IdentifierContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteral?: (ctx: LiteralContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.compOp`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCompOp?: (ctx: CompOpContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.arthOp`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArthOp?: (ctx: ArthOpContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.polarOp`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPolarOp?: (ctx: PolarOpContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.logOp`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLogOp?: (ctx: LogOpContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.boolean`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBoolean?: (ctx: BooleanContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.null`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNull?: (ctx: NullContext) => Result;

	/**
	 * Visit a parse tree produced by `OWOFilterParser.infinity`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInfinity?: (ctx: InfinityContext) => Result;
}

