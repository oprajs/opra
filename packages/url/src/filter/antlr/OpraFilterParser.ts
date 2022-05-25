// Generated from src/filter/antlr/OpraFilter.g4 by ANTLR 4.9.0-SNAPSHOT
// noinspection ES6UnusedImports,ExceptionCaughtLocallyJS


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import type { OpraFilterVisitor } from "./OpraFilterVisitor";


export class OpraFilterParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly T__5 = 6;
	public static readonly T__6 = 7;
	public static readonly T__7 = 8;
	public static readonly T__8 = 9;
	public static readonly T__9 = 10;
	public static readonly T__10 = 11;
	public static readonly T__11 = 12;
	public static readonly T__12 = 13;
	public static readonly T__13 = 14;
	public static readonly T__14 = 15;
	public static readonly T__15 = 16;
	public static readonly T__16 = 17;
	public static readonly T__17 = 18;
	public static readonly T__18 = 19;
	public static readonly T__19 = 20;
	public static readonly T__20 = 21;
	public static readonly T__21 = 22;
	public static readonly T__22 = 23;
	public static readonly T__23 = 24;
	public static readonly T__24 = 25;
	public static readonly T__25 = 26;
	public static readonly T__26 = 27;
	public static readonly T__27 = 28;
	public static readonly T__28 = 29;
	public static readonly T__29 = 30;
	public static readonly T__30 = 31;
	public static readonly T__31 = 32;
	public static readonly T__32 = 33;
	public static readonly T__33 = 34;
	public static readonly T__34 = 35;
	public static readonly T__35 = 36;
	public static readonly T__36 = 37;
	public static readonly T__37 = 38;
	public static readonly T__38 = 39;
	public static readonly T__39 = 40;
	public static readonly T__40 = 41;
	public static readonly T__41 = 42;
	public static readonly T__42 = 43;
	public static readonly T__43 = 44;
	public static readonly T__44 = 45;
	public static readonly T__45 = 46;
	public static readonly DATE = 47;
	public static readonly DATETIME = 48;
	public static readonly TIME = 49;
	public static readonly IDENTIFIER = 50;
	public static readonly STRING = 51;
	public static readonly NUMBER = 52;
	public static readonly INTEGER = 53;
	public static readonly WHITESPACE = 54;
	public static readonly COMMENT = 55;
	public static readonly LINE_COMMENT = 56;
	public static readonly RULE_root = 0;
	public static readonly RULE_expression = 1;
	public static readonly RULE_term = 2;
	public static readonly RULE_invocable = 3;
	public static readonly RULE_invocation = 4;
	public static readonly RULE_indexer = 5;
	public static readonly RULE_function = 6;
	public static readonly RULE_paramList = 7;
	public static readonly RULE_unit = 8;
	public static readonly RULE_dateTimePrecision = 9;
	public static readonly RULE_pluralDateTimePrecision = 10;
	public static readonly RULE_qualifiedIdentifier = 11;
	public static readonly RULE_externalConstant = 12;
	public static readonly RULE_identifier = 13;
	public static readonly RULE_literal = 14;
	public static readonly RULE_compOp = 15;
	public static readonly RULE_arthOp = 16;
	public static readonly RULE_polarOp = 17;
	public static readonly RULE_logOp = 18;
	public static readonly RULE_boolean = 19;
	public static readonly RULE_null = 20;
	public static readonly RULE_infinity = 21;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"root", "expression", "term", "invocable", "invocation", "indexer", "function",
		"paramList", "unit", "dateTimePrecision", "pluralDateTimePrecision", "qualifiedIdentifier",
		"externalConstant", "identifier", "literal", "compOp", "arthOp", "polarOp",
		"logOp", "boolean", "null", "infinity",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'('", "')'", "'['", "','", "']'", "'year'", "'month'", "'week'",
		"'day'", "'hour'", "'minute'", "'second'", "'millisecond'", "'years'",
		"'months'", "'weeks'", "'days'", "'hours'", "'minutes'", "'seconds'",
		"'milliseconds'", "'.'", "'@'", "'<='", "'<'", "'>'", "'>='", "'='", "'!='",
		"'in'", "'!in'", "'like'", "'!like'", "'ilike'", "'!ilike'", "'+'", "'-'",
		"'*'", "'/'", "'and'", "'or'", "'true'", "'false'", "'null'", "'Infinity'",
		"'infinity'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined,
		undefined, undefined, undefined, undefined, undefined, undefined, undefined,
		undefined, undefined, undefined, undefined, undefined, undefined, undefined,
		undefined, undefined, undefined, undefined, undefined, undefined, undefined,
		undefined, undefined, undefined, undefined, undefined, undefined, undefined,
		undefined, undefined, undefined, undefined, undefined, undefined, undefined,
		undefined, undefined, undefined, undefined, undefined, "DATE", "DATETIME",
		"TIME", "IDENTIFIER", "STRING", "NUMBER", "INTEGER", "WHITESPACE", "COMMENT",
		"LINE_COMMENT",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(OpraFilterParser._LITERAL_NAMES, OpraFilterParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return OpraFilterParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "OpraFilter.g4"; }

	// @Override
	public get ruleNames(): string[] { return OpraFilterParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return OpraFilterParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(OpraFilterParser._ATN, this);
	}
	// @RuleVersion(0)
	public root(): RootContext {
		let _localctx: RootContext = new RootContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, OpraFilterParser.RULE_root);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 44;
			this.expression(0);
			this.state = 45;
			this.match(OpraFilterParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public expression(): ExpressionContext;
	public expression(_p: number): ExpressionContext;
	// @RuleVersion(0)
	public expression(_p?: number): ExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: ExpressionContext = new ExpressionContext(this._ctx, _parentState);
		let _prevctx: ExpressionContext = _localctx;
		let _startState: number = 2;
		this.enterRecursionRule(_localctx, 2, OpraFilterParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 67;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case OpraFilterParser.T__22:
			case OpraFilterParser.T__41:
			case OpraFilterParser.T__42:
			case OpraFilterParser.T__43:
			case OpraFilterParser.T__44:
			case OpraFilterParser.T__45:
			case OpraFilterParser.DATE:
			case OpraFilterParser.DATETIME:
			case OpraFilterParser.TIME:
			case OpraFilterParser.IDENTIFIER:
			case OpraFilterParser.STRING:
			case OpraFilterParser.NUMBER:
				{
				_localctx = new TermExpressionContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 48;
				this.term();
				}
				break;
			case OpraFilterParser.T__35:
			case OpraFilterParser.T__36:
				{
				_localctx = new PolarityExpressionContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 49;
				this.polarOp();
				this.state = 50;
				this.expression(6);
				}
				break;
			case OpraFilterParser.T__0:
				{
				_localctx = new ParenthesizedExpressionContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 52;
				this.match(OpraFilterParser.T__0);
				this.state = 53;
				this.expression(0);
				this.state = 54;
				this.match(OpraFilterParser.T__1);
				}
				break;
			case OpraFilterParser.T__2:
				{
				_localctx = new ArrayExpressionContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 56;
				this.match(OpraFilterParser.T__2);
				this.state = 57;
				this.expression(0);
				this.state = 62;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === OpraFilterParser.T__3) {
					{
					{
					this.state = 58;
					this.match(OpraFilterParser.T__3);
					this.state = 59;
					this.expression(0);
					}
					}
					this.state = 64;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 65;
				this.match(OpraFilterParser.T__4);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 83;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 3, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 81;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 2, this._ctx) ) {
					case 1:
						{
						_localctx = new ArithmeticExpressionContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, OpraFilterParser.RULE_expression);
						this.state = 69;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 70;
						this.arthOp();
						this.state = 71;
						this.expression(6);
						}
						break;

					case 2:
						{
						_localctx = new ComparisonExpressionContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, OpraFilterParser.RULE_expression);
						this.state = 73;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 74;
						this.compOp();
						this.state = 75;
						this.expression(5);
						}
						break;

					case 3:
						{
						_localctx = new LogicalExpressionContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, OpraFilterParser.RULE_expression);
						this.state = 77;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 78;
						this.logOp();
						this.state = 79;
						this.expression(4);
						}
						break;
					}
					}
				}
				this.state = 85;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 3, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public term(): TermContext {
		let _localctx: TermContext = new TermContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, OpraFilterParser.RULE_term);
		try {
			this.state = 89;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case OpraFilterParser.T__41:
			case OpraFilterParser.T__42:
			case OpraFilterParser.T__43:
			case OpraFilterParser.T__44:
			case OpraFilterParser.T__45:
			case OpraFilterParser.DATE:
			case OpraFilterParser.DATETIME:
			case OpraFilterParser.TIME:
			case OpraFilterParser.STRING:
			case OpraFilterParser.NUMBER:
				_localctx = new LiteralTermContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 86;
				this.literal();
				}
				break;
			case OpraFilterParser.IDENTIFIER:
				_localctx = new QualifiedIdentifierTermContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 87;
				this.qualifiedIdentifier();
				}
				break;
			case OpraFilterParser.T__22:
				_localctx = new ExternalConstantTermContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 88;
				this.externalConstant();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public invocable(): InvocableContext {
		let _localctx: InvocableContext = new InvocableContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, OpraFilterParser.RULE_invocable);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 91;
			this.function();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public invocation(): InvocationContext {
		let _localctx: InvocationContext = new InvocationContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, OpraFilterParser.RULE_invocation);
		try {
			_localctx = new MemberInvocationContext(_localctx);
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 93;
			this.identifier();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public indexer(): IndexerContext {
		let _localctx: IndexerContext = new IndexerContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, OpraFilterParser.RULE_indexer);
		try {
			this.state = 97;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case OpraFilterParser.IDENTIFIER:
				_localctx = new MemberIndexContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 95;
				this.identifier();
				}
				break;
			case OpraFilterParser.INTEGER:
				_localctx = new NumberIndexContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 96;
				this.match(OpraFilterParser.INTEGER);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public function(): FunctionContext {
		let _localctx: FunctionContext = new FunctionContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, OpraFilterParser.RULE_function);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 99;
			this.identifier();
			this.state = 100;
			this.match(OpraFilterParser.T__0);
			this.state = 102;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << OpraFilterParser.T__0) | (1 << OpraFilterParser.T__2) | (1 << OpraFilterParser.T__22))) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (OpraFilterParser.T__35 - 36)) | (1 << (OpraFilterParser.T__36 - 36)) | (1 << (OpraFilterParser.T__41 - 36)) | (1 << (OpraFilterParser.T__42 - 36)) | (1 << (OpraFilterParser.T__43 - 36)) | (1 << (OpraFilterParser.T__44 - 36)) | (1 << (OpraFilterParser.T__45 - 36)) | (1 << (OpraFilterParser.DATE - 36)) | (1 << (OpraFilterParser.DATETIME - 36)) | (1 << (OpraFilterParser.TIME - 36)) | (1 << (OpraFilterParser.IDENTIFIER - 36)) | (1 << (OpraFilterParser.STRING - 36)) | (1 << (OpraFilterParser.NUMBER - 36)))) !== 0)) {
				{
				this.state = 101;
				this.paramList();
				}
			}

			this.state = 104;
			this.match(OpraFilterParser.T__1);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public paramList(): ParamListContext {
		let _localctx: ParamListContext = new ParamListContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, OpraFilterParser.RULE_paramList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 106;
			this.expression(0);
			this.state = 111;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === OpraFilterParser.T__3) {
				{
				{
				this.state = 107;
				this.match(OpraFilterParser.T__3);
				this.state = 108;
				this.expression(0);
				}
				}
				this.state = 113;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public unit(): UnitContext {
		let _localctx: UnitContext = new UnitContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, OpraFilterParser.RULE_unit);
		try {
			this.state = 117;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case OpraFilterParser.T__5:
			case OpraFilterParser.T__6:
			case OpraFilterParser.T__7:
			case OpraFilterParser.T__8:
			case OpraFilterParser.T__9:
			case OpraFilterParser.T__10:
			case OpraFilterParser.T__11:
			case OpraFilterParser.T__12:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 114;
				this.dateTimePrecision();
				}
				break;
			case OpraFilterParser.T__13:
			case OpraFilterParser.T__14:
			case OpraFilterParser.T__15:
			case OpraFilterParser.T__16:
			case OpraFilterParser.T__17:
			case OpraFilterParser.T__18:
			case OpraFilterParser.T__19:
			case OpraFilterParser.T__20:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 115;
				this.pluralDateTimePrecision();
				}
				break;
			case OpraFilterParser.STRING:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 116;
				this.match(OpraFilterParser.STRING);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public dateTimePrecision(): DateTimePrecisionContext {
		let _localctx: DateTimePrecisionContext = new DateTimePrecisionContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, OpraFilterParser.RULE_dateTimePrecision);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 119;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << OpraFilterParser.T__5) | (1 << OpraFilterParser.T__6) | (1 << OpraFilterParser.T__7) | (1 << OpraFilterParser.T__8) | (1 << OpraFilterParser.T__9) | (1 << OpraFilterParser.T__10) | (1 << OpraFilterParser.T__11) | (1 << OpraFilterParser.T__12))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public pluralDateTimePrecision(): PluralDateTimePrecisionContext {
		let _localctx: PluralDateTimePrecisionContext = new PluralDateTimePrecisionContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, OpraFilterParser.RULE_pluralDateTimePrecision);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 121;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << OpraFilterParser.T__13) | (1 << OpraFilterParser.T__14) | (1 << OpraFilterParser.T__15) | (1 << OpraFilterParser.T__16) | (1 << OpraFilterParser.T__17) | (1 << OpraFilterParser.T__18) | (1 << OpraFilterParser.T__19) | (1 << OpraFilterParser.T__20))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public qualifiedIdentifier(): QualifiedIdentifierContext {
		let _localctx: QualifiedIdentifierContext = new QualifiedIdentifierContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, OpraFilterParser.RULE_qualifiedIdentifier);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 128;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 9, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 123;
					this.identifier();
					this.state = 124;
					this.match(OpraFilterParser.T__21);
					}
					}
				}
				this.state = 130;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 9, this._ctx);
			}
			this.state = 131;
			this.identifier();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public externalConstant(): ExternalConstantContext {
		let _localctx: ExternalConstantContext = new ExternalConstantContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, OpraFilterParser.RULE_externalConstant);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 133;
			this.match(OpraFilterParser.T__22);
			this.state = 134;
			_la = this._input.LA(1);
			if (!(_la === OpraFilterParser.IDENTIFIER || _la === OpraFilterParser.STRING)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public identifier(): IdentifierContext {
		let _localctx: IdentifierContext = new IdentifierContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, OpraFilterParser.RULE_identifier);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 136;
			this.match(OpraFilterParser.IDENTIFIER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public literal(): LiteralContext {
		let _localctx: LiteralContext = new LiteralContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, OpraFilterParser.RULE_literal);
		try {
			this.state = 146;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case OpraFilterParser.NUMBER:
				_localctx = new NumberLiteralContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 138;
				this.match(OpraFilterParser.NUMBER);
				}
				break;
			case OpraFilterParser.T__44:
			case OpraFilterParser.T__45:
				_localctx = new InfinityLiteralContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 139;
				this.infinity();
				}
				break;
			case OpraFilterParser.T__41:
			case OpraFilterParser.T__42:
				_localctx = new BooleanLiteralContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 140;
				this.boolean();
				}
				break;
			case OpraFilterParser.T__43:
				_localctx = new NullLiteralContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 141;
				this.null();
				}
				break;
			case OpraFilterParser.DATE:
				_localctx = new DateLiteralContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 142;
				this.match(OpraFilterParser.DATE);
				}
				break;
			case OpraFilterParser.DATETIME:
				_localctx = new DateTimeLiteralContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 143;
				this.match(OpraFilterParser.DATETIME);
				}
				break;
			case OpraFilterParser.TIME:
				_localctx = new TimeLiteralContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 144;
				this.match(OpraFilterParser.TIME);
				}
				break;
			case OpraFilterParser.STRING:
				_localctx = new StringLiteralContext(_localctx);
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 145;
				this.match(OpraFilterParser.STRING);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public compOp(): CompOpContext {
		let _localctx: CompOpContext = new CompOpContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, OpraFilterParser.RULE_compOp);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 148;
			_la = this._input.LA(1);
			if (!(((((_la - 24)) & ~0x1F) === 0 && ((1 << (_la - 24)) & ((1 << (OpraFilterParser.T__23 - 24)) | (1 << (OpraFilterParser.T__24 - 24)) | (1 << (OpraFilterParser.T__25 - 24)) | (1 << (OpraFilterParser.T__26 - 24)) | (1 << (OpraFilterParser.T__27 - 24)) | (1 << (OpraFilterParser.T__28 - 24)) | (1 << (OpraFilterParser.T__29 - 24)) | (1 << (OpraFilterParser.T__30 - 24)) | (1 << (OpraFilterParser.T__31 - 24)) | (1 << (OpraFilterParser.T__32 - 24)) | (1 << (OpraFilterParser.T__33 - 24)) | (1 << (OpraFilterParser.T__34 - 24)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public arthOp(): ArthOpContext {
		let _localctx: ArthOpContext = new ArthOpContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, OpraFilterParser.RULE_arthOp);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 150;
			_la = this._input.LA(1);
			if (!(((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (OpraFilterParser.T__35 - 36)) | (1 << (OpraFilterParser.T__36 - 36)) | (1 << (OpraFilterParser.T__37 - 36)) | (1 << (OpraFilterParser.T__38 - 36)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public polarOp(): PolarOpContext {
		let _localctx: PolarOpContext = new PolarOpContext(this._ctx, this.state);
		this.enterRule(_localctx, 34, OpraFilterParser.RULE_polarOp);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 152;
			_la = this._input.LA(1);
			if (!(_la === OpraFilterParser.T__35 || _la === OpraFilterParser.T__36)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public logOp(): LogOpContext {
		let _localctx: LogOpContext = new LogOpContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, OpraFilterParser.RULE_logOp);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 154;
			_la = this._input.LA(1);
			if (!(_la === OpraFilterParser.T__39 || _la === OpraFilterParser.T__40)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public boolean(): BooleanContext {
		let _localctx: BooleanContext = new BooleanContext(this._ctx, this.state);
		this.enterRule(_localctx, 38, OpraFilterParser.RULE_boolean);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 156;
			_la = this._input.LA(1);
			if (!(_la === OpraFilterParser.T__41 || _la === OpraFilterParser.T__42)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public null(): NullContext {
		let _localctx: NullContext = new NullContext(this._ctx, this.state);
		this.enterRule(_localctx, 40, OpraFilterParser.RULE_null);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 158;
			this.match(OpraFilterParser.T__43);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public infinity(): InfinityContext {
		let _localctx: InfinityContext = new InfinityContext(this._ctx, this.state);
		this.enterRule(_localctx, 42, OpraFilterParser.RULE_infinity);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 160;
			_la = this._input.LA(1);
			if (!(_la === OpraFilterParser.T__44 || _la === OpraFilterParser.T__45)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 1:
			return this.expression_sempred(_localctx as ExpressionContext, predIndex);
		}
		return true;
	}
	private expression_sempred(_localctx: ExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 5);

		case 1:
			return this.precpred(this._ctx, 4);

		case 2:
			return this.precpred(this._ctx, 3);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03:\xA5\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x03" +
		"\x02\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x07\x03?\n\x03\f" +
		"\x03\x0E\x03B\v\x03\x03\x03\x03\x03\x05\x03F\n\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x07\x03T\n\x03\f\x03\x0E\x03W\v\x03\x03\x04\x03\x04\x03\x04\x05\x04" +
		"\\\n\x04\x03\x05\x03\x05\x03\x06\x03\x06\x03\x07\x03\x07\x05\x07d\n\x07" +
		"\x03\b\x03\b\x03\b\x05\bi\n\b\x03\b\x03\b\x03\t\x03\t\x03\t\x07\tp\n\t" +
		"\f\t\x0E\ts\v\t\x03\n\x03\n\x03\n\x05\nx\n\n\x03\v\x03\v\x03\f\x03\f\x03" +
		"\r\x03\r\x03\r\x07\r\x81\n\r\f\r\x0E\r\x84\v\r\x03\r\x03\r\x03\x0E\x03" +
		"\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03" +
		"\x10\x03\x10\x03\x10\x05\x10\x95\n\x10\x03\x11\x03\x11\x03\x12\x03\x12" +
		"\x03\x13\x03\x13\x03\x14\x03\x14\x03\x15\x03\x15\x03\x16\x03\x16\x03\x17" +
		"\x03\x17\x03\x17\x02\x02\x03\x04\x18\x02\x02\x04\x02\x06\x02\b\x02\n\x02" +
		"\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02" +
		"\x1E\x02 \x02\"\x02$\x02&\x02(\x02*\x02,\x02\x02\v\x03\x02\b\x0F\x03\x02" +
		"\x10\x17\x03\x0245\x03\x02\x1A%\x03\x02&)\x03\x02&\'\x03\x02*+\x03\x02" +
		",-\x03\x02/0\x02\xA4\x02.\x03\x02\x02\x02\x04E\x03\x02\x02\x02\x06[\x03" +
		"\x02\x02\x02\b]\x03\x02\x02\x02\n_\x03\x02\x02\x02\fc\x03\x02\x02\x02" +
		"\x0Ee\x03\x02\x02\x02\x10l\x03\x02\x02\x02\x12w\x03\x02\x02\x02\x14y\x03" +
		"\x02\x02\x02\x16{\x03\x02\x02\x02\x18\x82\x03\x02\x02\x02\x1A\x87\x03" +
		"\x02\x02\x02\x1C\x8A\x03\x02\x02\x02\x1E\x94\x03\x02\x02\x02 \x96\x03" +
		"\x02\x02\x02\"\x98\x03\x02\x02\x02$\x9A\x03\x02\x02\x02&\x9C\x03\x02\x02" +
		"\x02(\x9E\x03\x02\x02\x02*\xA0\x03\x02\x02\x02,\xA2\x03\x02\x02\x02./" +
		"\x05\x04\x03\x02/0\x07\x02\x02\x030\x03\x03\x02\x02\x0212\b\x03\x01\x02" +
		"2F\x05\x06\x04\x0234\x05$\x13\x0245\x05\x04\x03\b5F\x03\x02\x02\x0267" +
		"\x07\x03\x02\x0278\x05\x04\x03\x0289\x07\x04\x02\x029F\x03\x02\x02\x02" +
		":;\x07\x05\x02\x02;@\x05\x04\x03\x02<=\x07\x06\x02\x02=?\x05\x04\x03\x02" +
		"><\x03\x02\x02\x02?B\x03\x02\x02\x02@>\x03\x02\x02\x02@A\x03\x02\x02\x02" +
		"AC\x03\x02\x02\x02B@\x03\x02\x02\x02CD\x07\x07\x02\x02DF\x03\x02\x02\x02" +
		"E1\x03\x02\x02\x02E3\x03\x02\x02\x02E6\x03\x02\x02\x02E:\x03\x02\x02\x02" +
		"FU\x03\x02\x02\x02GH\f\x07\x02\x02HI\x05\"\x12\x02IJ\x05\x04\x03\bJT\x03" +
		"\x02\x02\x02KL\f\x06\x02\x02LM\x05 \x11\x02MN\x05\x04\x03\x07NT\x03\x02" +
		"\x02\x02OP\f\x05\x02\x02PQ\x05&\x14\x02QR\x05\x04\x03\x06RT\x03\x02\x02" +
		"\x02SG\x03\x02\x02\x02SK\x03\x02\x02\x02SO\x03\x02\x02\x02TW\x03\x02\x02" +
		"\x02US\x03\x02\x02\x02UV\x03\x02\x02\x02V\x05\x03\x02\x02\x02WU\x03\x02" +
		"\x02\x02X\\\x05\x1E\x10\x02Y\\\x05\x18\r\x02Z\\\x05\x1A\x0E\x02[X\x03" +
		"\x02\x02\x02[Y\x03\x02\x02\x02[Z\x03\x02\x02\x02\\\x07\x03\x02\x02\x02" +
		"]^\x05\x0E\b\x02^\t\x03\x02\x02\x02_`\x05\x1C\x0F\x02`\v\x03\x02\x02\x02" +
		"ad\x05\x1C\x0F\x02bd\x077\x02\x02ca\x03\x02\x02\x02cb\x03\x02\x02\x02" +
		"d\r\x03\x02\x02\x02ef\x05\x1C\x0F\x02fh\x07\x03\x02\x02gi\x05\x10\t\x02" +
		"hg\x03\x02\x02\x02hi\x03\x02\x02\x02ij\x03\x02\x02\x02jk\x07\x04\x02\x02" +
		"k\x0F\x03\x02\x02\x02lq\x05\x04\x03\x02mn\x07\x06\x02\x02np\x05\x04\x03" +
		"\x02om\x03\x02\x02\x02ps\x03\x02\x02\x02qo\x03\x02\x02\x02qr\x03\x02\x02" +
		"\x02r\x11\x03\x02\x02\x02sq\x03\x02\x02\x02tx\x05\x14\v\x02ux\x05\x16" +
		"\f\x02vx\x075\x02\x02wt\x03\x02\x02\x02wu\x03\x02\x02\x02wv\x03\x02\x02" +
		"\x02x\x13\x03\x02\x02\x02yz\t\x02\x02\x02z\x15\x03\x02\x02\x02{|\t\x03" +
		"\x02\x02|\x17\x03\x02\x02\x02}~\x05\x1C\x0F\x02~\x7F\x07\x18\x02\x02\x7F" +
		"\x81\x03\x02\x02\x02\x80}\x03\x02\x02\x02\x81\x84\x03\x02\x02\x02\x82" +
		"\x80\x03\x02\x02\x02\x82\x83\x03\x02\x02\x02\x83\x85\x03\x02\x02\x02\x84" +
		"\x82\x03\x02\x02\x02\x85\x86\x05\x1C\x0F\x02\x86\x19\x03\x02\x02\x02\x87" +
		"\x88\x07\x19\x02\x02\x88\x89\t\x04\x02\x02\x89\x1B\x03\x02\x02\x02\x8A" +
		"\x8B\x074\x02\x02\x8B\x1D\x03\x02\x02\x02\x8C\x95\x076\x02\x02\x8D\x95" +
		"\x05,\x17\x02\x8E\x95\x05(\x15\x02\x8F\x95\x05*\x16\x02\x90\x95\x071\x02" +
		"\x02\x91\x95\x072\x02\x02\x92\x95\x073\x02\x02\x93\x95\x075\x02\x02\x94" +
		"\x8C\x03\x02\x02\x02\x94\x8D\x03\x02\x02\x02\x94\x8E\x03\x02\x02\x02\x94" +
		"\x8F\x03\x02\x02\x02\x94\x90\x03\x02\x02\x02\x94\x91\x03\x02\x02\x02\x94" +
		"\x92\x03\x02\x02\x02\x94\x93\x03\x02\x02\x02\x95\x1F\x03\x02\x02\x02\x96" +
		"\x97\t\x05\x02\x02\x97!\x03\x02\x02\x02\x98\x99\t\x06\x02\x02\x99#\x03" +
		"\x02\x02\x02\x9A\x9B\t\x07\x02\x02\x9B%\x03\x02\x02\x02\x9C\x9D\t\b\x02" +
		"\x02\x9D\'\x03\x02\x02\x02\x9E\x9F\t\t\x02\x02\x9F)\x03\x02\x02\x02\xA0" +
		"\xA1\x07.\x02\x02\xA1+\x03\x02\x02\x02\xA2\xA3\t\n\x02\x02\xA3-\x03\x02" +
		"\x02\x02\r@ESU[chqw\x82\x94";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!OpraFilterParser.__ATN) {
			OpraFilterParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(OpraFilterParser._serializedATN));
		}

		return OpraFilterParser.__ATN;
	}

}

export class RootContext extends ParserRuleContext {
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public EOF(): TerminalNode { return this.getToken(OpraFilterParser.EOF, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_root; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitRoot) {
			return visitor.visitRoot(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_expression; }
	public copyFrom(ctx: ExpressionContext): void {
		super.copyFrom(ctx);
	}
}
export class TermExpressionContext extends ExpressionContext {
	public term(): TermContext {
		return this.getRuleContext(0, TermContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitTermExpression) {
			return visitor.visitTermExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PolarityExpressionContext extends ExpressionContext {
	public polarOp(): PolarOpContext {
		return this.getRuleContext(0, PolarOpContext);
	}
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitPolarityExpression) {
			return visitor.visitPolarityExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ArithmeticExpressionContext extends ExpressionContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public arthOp(): ArthOpContext {
		return this.getRuleContext(0, ArthOpContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitArithmeticExpression) {
			return visitor.visitArithmeticExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ComparisonExpressionContext extends ExpressionContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public compOp(): CompOpContext {
		return this.getRuleContext(0, CompOpContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitComparisonExpression) {
			return visitor.visitComparisonExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LogicalExpressionContext extends ExpressionContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public logOp(): LogOpContext {
		return this.getRuleContext(0, LogOpContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitLogicalExpression) {
			return visitor.visitLogicalExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ParenthesizedExpressionContext extends ExpressionContext {
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitParenthesizedExpression) {
			return visitor.visitParenthesizedExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ArrayExpressionContext extends ExpressionContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitArrayExpression) {
			return visitor.visitArrayExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TermContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_term; }
	public copyFrom(ctx: TermContext): void {
		super.copyFrom(ctx);
	}
}
export class LiteralTermContext extends TermContext {
	public literal(): LiteralContext {
		return this.getRuleContext(0, LiteralContext);
	}
	constructor(ctx: TermContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitLiteralTerm) {
			return visitor.visitLiteralTerm(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class QualifiedIdentifierTermContext extends TermContext {
	public qualifiedIdentifier(): QualifiedIdentifierContext {
		return this.getRuleContext(0, QualifiedIdentifierContext);
	}
	constructor(ctx: TermContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitQualifiedIdentifierTerm) {
			return visitor.visitQualifiedIdentifierTerm(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ExternalConstantTermContext extends TermContext {
	public externalConstant(): ExternalConstantContext {
		return this.getRuleContext(0, ExternalConstantContext);
	}
	constructor(ctx: TermContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitExternalConstantTerm) {
			return visitor.visitExternalConstantTerm(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class InvocableContext extends ParserRuleContext {
	public function(): FunctionContext {
		return this.getRuleContext(0, FunctionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_invocable; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitInvocable) {
			return visitor.visitInvocable(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class InvocationContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_invocation; }
	public copyFrom(ctx: InvocationContext): void {
		super.copyFrom(ctx);
	}
}
export class MemberInvocationContext extends InvocationContext {
	public identifier(): IdentifierContext {
		return this.getRuleContext(0, IdentifierContext);
	}
	constructor(ctx: InvocationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitMemberInvocation) {
			return visitor.visitMemberInvocation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IndexerContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_indexer; }
	public copyFrom(ctx: IndexerContext): void {
		super.copyFrom(ctx);
	}
}
export class MemberIndexContext extends IndexerContext {
	public identifier(): IdentifierContext {
		return this.getRuleContext(0, IdentifierContext);
	}
	constructor(ctx: IndexerContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitMemberIndex) {
			return visitor.visitMemberIndex(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NumberIndexContext extends IndexerContext {
	public INTEGER(): TerminalNode { return this.getToken(OpraFilterParser.INTEGER, 0); }
	constructor(ctx: IndexerContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitNumberIndex) {
			return visitor.visitNumberIndex(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FunctionContext extends ParserRuleContext {
	public identifier(): IdentifierContext {
		return this.getRuleContext(0, IdentifierContext);
	}
	public paramList(): ParamListContext | undefined {
		return this.tryGetRuleContext(0, ParamListContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_function; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitFunction) {
			return visitor.visitFunction(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParamListContext extends ParserRuleContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_paramList; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitParamList) {
			return visitor.visitParamList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnitContext extends ParserRuleContext {
	public dateTimePrecision(): DateTimePrecisionContext | undefined {
		return this.tryGetRuleContext(0, DateTimePrecisionContext);
	}
	public pluralDateTimePrecision(): PluralDateTimePrecisionContext | undefined {
		return this.tryGetRuleContext(0, PluralDateTimePrecisionContext);
	}
	public STRING(): TerminalNode | undefined { return this.tryGetToken(OpraFilterParser.STRING, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_unit; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitUnit) {
			return visitor.visitUnit(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DateTimePrecisionContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_dateTimePrecision; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitDateTimePrecision) {
			return visitor.visitDateTimePrecision(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PluralDateTimePrecisionContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_pluralDateTimePrecision; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitPluralDateTimePrecision) {
			return visitor.visitPluralDateTimePrecision(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class QualifiedIdentifierContext extends ParserRuleContext {
	public identifier(): IdentifierContext[];
	public identifier(i: number): IdentifierContext;
	public identifier(i?: number): IdentifierContext | IdentifierContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IdentifierContext);
		} else {
			return this.getRuleContext(i, IdentifierContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_qualifiedIdentifier; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitQualifiedIdentifier) {
			return visitor.visitQualifiedIdentifier(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExternalConstantContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(OpraFilterParser.IDENTIFIER, 0); }
	public STRING(): TerminalNode | undefined { return this.tryGetToken(OpraFilterParser.STRING, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_externalConstant; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitExternalConstant) {
			return visitor.visitExternalConstant(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IdentifierContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(OpraFilterParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_identifier; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitIdentifier) {
			return visitor.visitIdentifier(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LiteralContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_literal; }
	public copyFrom(ctx: LiteralContext): void {
		super.copyFrom(ctx);
	}
}
export class NumberLiteralContext extends LiteralContext {
	public NUMBER(): TerminalNode { return this.getToken(OpraFilterParser.NUMBER, 0); }
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitNumberLiteral) {
			return visitor.visitNumberLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class InfinityLiteralContext extends LiteralContext {
	public infinity(): InfinityContext {
		return this.getRuleContext(0, InfinityContext);
	}
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitInfinityLiteral) {
			return visitor.visitInfinityLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BooleanLiteralContext extends LiteralContext {
	public boolean(): BooleanContext {
		return this.getRuleContext(0, BooleanContext);
	}
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitBooleanLiteral) {
			return visitor.visitBooleanLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NullLiteralContext extends LiteralContext {
	public null(): NullContext {
		return this.getRuleContext(0, NullContext);
	}
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitNullLiteral) {
			return visitor.visitNullLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class DateLiteralContext extends LiteralContext {
	public DATE(): TerminalNode { return this.getToken(OpraFilterParser.DATE, 0); }
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitDateLiteral) {
			return visitor.visitDateLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class DateTimeLiteralContext extends LiteralContext {
	public DATETIME(): TerminalNode { return this.getToken(OpraFilterParser.DATETIME, 0); }
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitDateTimeLiteral) {
			return visitor.visitDateTimeLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TimeLiteralContext extends LiteralContext {
	public TIME(): TerminalNode { return this.getToken(OpraFilterParser.TIME, 0); }
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitTimeLiteral) {
			return visitor.visitTimeLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class StringLiteralContext extends LiteralContext {
	public STRING(): TerminalNode { return this.getToken(OpraFilterParser.STRING, 0); }
	constructor(ctx: LiteralContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitStringLiteral) {
			return visitor.visitStringLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CompOpContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_compOp; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitCompOp) {
			return visitor.visitCompOp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ArthOpContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_arthOp; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitArthOp) {
			return visitor.visitArthOp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PolarOpContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_polarOp; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitPolarOp) {
			return visitor.visitPolarOp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LogOpContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_logOp; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitLogOp) {
			return visitor.visitLogOp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BooleanContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_boolean; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitBoolean) {
			return visitor.visitBoolean(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NullContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_null; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitNull) {
			return visitor.visitNull(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class InfinityContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return OpraFilterParser.RULE_infinity; }
	// @Override
	public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
		if (visitor.visitInfinity) {
			return visitor.visitInfinity(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


