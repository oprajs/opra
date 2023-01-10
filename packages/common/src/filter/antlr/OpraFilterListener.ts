// Generated from ./src/filter/antlr/OpraFilter.g4 by ANTLR 4.11.2-SNAPSHOT
import { ParseTreeListener } from "antlr4";
import {
  ArithmeticExpressionContext,
  ArrayExpressionContext,
  ArthOpContext,
  BooleanContext,
  BooleanLiteralContext,
  ComparisonExpressionContext,
  CompOpContext,
  DateLiteralContext,
  DateTimeLiteralContext,
  DateTimePrecisionContext,
  ExternalConstantContext,
  ExternalConstantTermContext,
  FunctionContext,
  IdentifierContext,
  InfinityContext,
  InfinityLiteralContext,
  InvocableContext,
  LiteralTermContext,
  LogicalExpressionContext,
  LogOpContext,
  MemberIndexContext,
  MemberInvocationContext,
  NullContext,
  NullLiteralContext,
  NumberIndexContext,
  NumberLiteralContext,
  ParamListContext,
  ParenthesizedExpressionContext,
  PluralDateTimePrecisionContext,
  PolarityExpressionContext,
  PolarOpContext,
  QualifiedIdentifierContext,
  QualifiedIdentifierTermContext,
  RootContext,
  StringLiteralContext,
  TermExpressionContext,
  TimeLiteralContext,
  UnitContext
} from "./OpraFilterParser.js";


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
   * Enter a parse tree produced by the `arrayExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  enterArrayExpression?: (ctx: ArrayExpressionContext) => void;
  /**
   * Exit a parse tree produced by the `arrayExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  exitArrayExpression?: (ctx: ArrayExpressionContext) => void;
  /**
   * Enter a parse tree produced by the `polarityExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  enterPolarityExpression?: (ctx: PolarityExpressionContext) => void;
  /**
   * Exit a parse tree produced by the `polarityExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  exitPolarityExpression?: (ctx: PolarityExpressionContext) => void;
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
   * Enter a parse tree produced by the `arithmeticExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  enterArithmeticExpression?: (ctx: ArithmeticExpressionContext) => void;
  /**
   * Exit a parse tree produced by the `arithmeticExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  exitArithmeticExpression?: (ctx: ArithmeticExpressionContext) => void;
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
   * Enter a parse tree produced by the `termExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  enterTermExpression?: (ctx: TermExpressionContext) => void;
  /**
   * Exit a parse tree produced by the `termExpression`
   * labeled alternative in `OpraFilterParser.expression`.
   * @param ctx the parse tree
   */
  exitTermExpression?: (ctx: TermExpressionContext) => void;
  /**
   * Enter a parse tree produced by the `literalTerm`
   * labeled alternative in `OpraFilterParser.term`.
   * @param ctx the parse tree
   */
  enterLiteralTerm?: (ctx: LiteralTermContext) => void;
  /**
   * Exit a parse tree produced by the `literalTerm`
   * labeled alternative in `OpraFilterParser.term`.
   * @param ctx the parse tree
   */
  exitLiteralTerm?: (ctx: LiteralTermContext) => void;
  /**
   * Enter a parse tree produced by the `qualifiedIdentifierTerm`
   * labeled alternative in `OpraFilterParser.term`.
   * @param ctx the parse tree
   */
  enterQualifiedIdentifierTerm?: (ctx: QualifiedIdentifierTermContext) => void;
  /**
   * Exit a parse tree produced by the `qualifiedIdentifierTerm`
   * labeled alternative in `OpraFilterParser.term`.
   * @param ctx the parse tree
   */
  exitQualifiedIdentifierTerm?: (ctx: QualifiedIdentifierTermContext) => void;
  /**
   * Enter a parse tree produced by the `externalConstantTerm`
   * labeled alternative in `OpraFilterParser.term`.
   * @param ctx the parse tree
   */
  enterExternalConstantTerm?: (ctx: ExternalConstantTermContext) => void;
  /**
   * Exit a parse tree produced by the `externalConstantTerm`
   * labeled alternative in `OpraFilterParser.term`.
   * @param ctx the parse tree
   */
  exitExternalConstantTerm?: (ctx: ExternalConstantTermContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.invocable`.
   * @param ctx the parse tree
   */
  enterInvocable?: (ctx: InvocableContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.invocable`.
   * @param ctx the parse tree
   */
  exitInvocable?: (ctx: InvocableContext) => void;
  /**
   * Enter a parse tree produced by the `memberInvocation`
   * labeled alternative in `OpraFilterParser.invocation`.
   * @param ctx the parse tree
   */
  enterMemberInvocation?: (ctx: MemberInvocationContext) => void;
  /**
   * Exit a parse tree produced by the `memberInvocation`
   * labeled alternative in `OpraFilterParser.invocation`.
   * @param ctx the parse tree
   */
  exitMemberInvocation?: (ctx: MemberInvocationContext) => void;
  /**
   * Enter a parse tree produced by the `memberIndex`
   * labeled alternative in `OpraFilterParser.indexer`.
   * @param ctx the parse tree
   */
  enterMemberIndex?: (ctx: MemberIndexContext) => void;
  /**
   * Exit a parse tree produced by the `memberIndex`
   * labeled alternative in `OpraFilterParser.indexer`.
   * @param ctx the parse tree
   */
  exitMemberIndex?: (ctx: MemberIndexContext) => void;
  /**
   * Enter a parse tree produced by the `numberIndex`
   * labeled alternative in `OpraFilterParser.indexer`.
   * @param ctx the parse tree
   */
  enterNumberIndex?: (ctx: NumberIndexContext) => void;
  /**
   * Exit a parse tree produced by the `numberIndex`
   * labeled alternative in `OpraFilterParser.indexer`.
   * @param ctx the parse tree
   */
  exitNumberIndex?: (ctx: NumberIndexContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.function`.
   * @param ctx the parse tree
   */
  enterFunction?: (ctx: FunctionContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.function`.
   * @param ctx the parse tree
   */
  exitFunction?: (ctx: FunctionContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.paramList`.
   * @param ctx the parse tree
   */
  enterParamList?: (ctx: ParamListContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.paramList`.
   * @param ctx the parse tree
   */
  exitParamList?: (ctx: ParamListContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.unit`.
   * @param ctx the parse tree
   */
  enterUnit?: (ctx: UnitContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.unit`.
   * @param ctx the parse tree
   */
  exitUnit?: (ctx: UnitContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.dateTimePrecision`.
   * @param ctx the parse tree
   */
  enterDateTimePrecision?: (ctx: DateTimePrecisionContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.dateTimePrecision`.
   * @param ctx the parse tree
   */
  exitDateTimePrecision?: (ctx: DateTimePrecisionContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.pluralDateTimePrecision`.
   * @param ctx the parse tree
   */
  enterPluralDateTimePrecision?: (ctx: PluralDateTimePrecisionContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.pluralDateTimePrecision`.
   * @param ctx the parse tree
   */
  exitPluralDateTimePrecision?: (ctx: PluralDateTimePrecisionContext) => void;
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
   * Enter a parse tree produced by the `numberLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  enterNumberLiteral?: (ctx: NumberLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `numberLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  exitNumberLiteral?: (ctx: NumberLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `infinityLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  enterInfinityLiteral?: (ctx: InfinityLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `infinityLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  exitInfinityLiteral?: (ctx: InfinityLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `booleanLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  enterBooleanLiteral?: (ctx: BooleanLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `booleanLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  exitBooleanLiteral?: (ctx: BooleanLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `nullLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  enterNullLiteral?: (ctx: NullLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `nullLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  exitNullLiteral?: (ctx: NullLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `dateLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  enterDateLiteral?: (ctx: DateLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `dateLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  exitDateLiteral?: (ctx: DateLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `dateTimeLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  enterDateTimeLiteral?: (ctx: DateTimeLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `dateTimeLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  exitDateTimeLiteral?: (ctx: DateTimeLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `timeLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  enterTimeLiteral?: (ctx: TimeLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `timeLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  exitTimeLiteral?: (ctx: TimeLiteralContext) => void;
  /**
   * Enter a parse tree produced by the `stringLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  enterStringLiteral?: (ctx: StringLiteralContext) => void;
  /**
   * Exit a parse tree produced by the `stringLiteral`
   * labeled alternative in `OpraFilterParser.literal`.
   * @param ctx the parse tree
   */
  exitStringLiteral?: (ctx: StringLiteralContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.compOp`.
   * @param ctx the parse tree
   */
  enterCompOp?: (ctx: CompOpContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.compOp`.
   * @param ctx the parse tree
   */
  exitCompOp?: (ctx: CompOpContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.arthOp`.
   * @param ctx the parse tree
   */
  enterArthOp?: (ctx: ArthOpContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.arthOp`.
   * @param ctx the parse tree
   */
  exitArthOp?: (ctx: ArthOpContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.polarOp`.
   * @param ctx the parse tree
   */
  enterPolarOp?: (ctx: PolarOpContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.polarOp`.
   * @param ctx the parse tree
   */
  exitPolarOp?: (ctx: PolarOpContext) => void;
  /**
   * Enter a parse tree produced by `OpraFilterParser.logOp`.
   * @param ctx the parse tree
   */
  enterLogOp?: (ctx: LogOpContext) => void;
  /**
   * Exit a parse tree produced by `OpraFilterParser.logOp`.
   * @param ctx the parse tree
   */
  exitLogOp?: (ctx: LogOpContext) => void;
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
}

