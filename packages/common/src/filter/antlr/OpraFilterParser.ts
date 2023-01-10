/* eslint-disable */
// Generated from ./src/filter/antlr/OpraFilter.g4 by ANTLR 4.11.2-SNAPSHOT
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols,SpellCheckingInspection
// @ts-nocheck

import {
  ATN,
  ATNDeserializer,
  DecisionState, DFA, FailedPredicateException,
  NoViableAltException, Parser, ParserATNSimulator,
  ParserRuleContext, PredictionContextCache,
  RecognitionException, RuleContext,
  TerminalNode, Token, TokenStream
} from 'antlr4';
import type OpraFilterListener from "./OpraFilterListener.js";
import type OpraFilterVisitor from "./OpraFilterVisitor.js";

// for running tests with parameters,
// eslint-disable-next-line no-unused-vars
type int = number;

export default class OpraFilterParser extends Parser {
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
  public static readonly EOF = Token.EOF;
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
  public static readonly literalNames: (string | null)[] = [null, "'('", "')'", "'['",
    "','", "']'", "'year'",
    "'month'", "'week'",
    "'day'", "'hour'", "'minute'",
    "'second'", "'millisecond'",
    "'years'", "'months'",
    "'weeks'", "'days'",
    "'hours'", "'minutes'",
    "'seconds'", "'milliseconds'",
    "'.'", "'@'", "'<='",
    "'<'", "'>'", "'>='",
    "'='", "'!='", "'in'",
    "'!in'", "'like'", "'!like'",
    "'ilike'", "'!ilike'",
    "'+'", "'-'", "'*'",
    "'/'", "'and'", "'or'",
    "'true'", "'false'",
    "'null'", "'Infinity'",
    "'infinity'"];
  public static readonly symbolicNames: (string | null)[] = [null, null, null, null,
    null, null, null, null,
    null, null, null, null,
    null, null, null, null,
    null, null, null, null,
    null, null, null, null,
    null, null, null, null,
    null, null, null, null,
    null, null, null, null,
    null, null, null, null,
    null, null, null, null,
    null, null, null, "DATE",
    "DATETIME", "TIME",
    "IDENTIFIER", "STRING",
    "NUMBER", "INTEGER",
    "WHITESPACE", "COMMENT",
    "LINE_COMMENT"];
  // tslint:disable:no-trailing-whitespace
  public static readonly ruleNames: string[] = [
    "root", "expression", "term", "invocable", "invocation", "indexer", "function",
    "paramList", "unit", "dateTimePrecision", "pluralDateTimePrecision", "qualifiedIdentifier",
    "externalConstant", "identifier", "literal", "compOp", "arthOp", "polarOp",
    "logOp", "boolean", "null", "infinity",
  ];

  public get grammarFileName(): string {
    return "OpraFilter.g4";
  }

  public get literalNames(): (string | null)[] {
    return OpraFilterParser.literalNames;
  }

  public get symbolicNames(): (string | null)[] {
    return OpraFilterParser.symbolicNames;
  }

  public get ruleNames(): string[] {
    return OpraFilterParser.ruleNames;
  }

  public get serializedATN(): number[] {
    return OpraFilterParser._serializedATN;
  }

  protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
    return new FailedPredicateException(this, predicate, message);
  }

  constructor(input: TokenStream) {
    super(input);
    this._interp = new ParserATNSimulator(this, OpraFilterParser._ATN, OpraFilterParser.DecisionsToDFA, new PredictionContextCache());
  }

  // @RuleVersion(0)
  public root(): RootContext {
    let localctx: RootContext = new RootContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, OpraFilterParser.RULE_root);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 44;
        this.expression(0);
        this.state = 45;
        this.match(OpraFilterParser.EOF);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
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
    let localctx: ExpressionContext = new ExpressionContext(this, this._ctx, _parentState);
    let _prevctx: ExpressionContext = localctx;
    let _startState: number = 2;
    this.enterRecursionRule(localctx, 2, OpraFilterParser.RULE_expression, _p);
    let _la: number;
    try {
      let _alt: number;
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 67;
        this._errHandler.sync(this);
        switch (this._input.LA(1)) {
          case 23:
          case 42:
          case 43:
          case 44:
          case 45:
          case 46:
          case 47:
          case 48:
          case 49:
          case 50:
          case 51:
          case 52: {
            localctx = new TermExpressionContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;

            this.state = 48;
            this.term();
          }
            break;
          case 36:
          case 37: {
            localctx = new PolarityExpressionContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 49;
            this.polarOp();
            this.state = 50;
            this.expression(6);
          }
            break;
          case 1: {
            localctx = new ParenthesizedExpressionContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 52;
            this.match(OpraFilterParser.T__0);
            this.state = 53;
            this.expression(0);
            this.state = 54;
            this.match(OpraFilterParser.T__1);
          }
            break;
          case 3: {
            localctx = new ArrayExpressionContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 56;
            this.match(OpraFilterParser.T__2);
            this.state = 57;
            this.expression(0);
            this.state = 62;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while (_la === 4) {
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
        this._ctx.stop = this._input.LT(-1);
        this.state = 83;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 3, this._ctx);
        while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            if (this._parseListeners != null) {
              this.triggerExitRuleEvent();
            }
            _prevctx = localctx;
            {
              this.state = 81;
              this._errHandler.sync(this);
              switch (this._interp.adaptivePredict(this._input, 2, this._ctx)) {
                case 1: {
                  localctx = new ArithmeticExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                  this.pushNewRecursionContext(localctx, _startState, OpraFilterParser.RULE_expression);
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
                case 2: {
                  localctx = new ComparisonExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                  this.pushNewRecursionContext(localctx, _startState, OpraFilterParser.RULE_expression);
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
                case 3: {
                  localctx = new LogicalExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                  this.pushNewRecursionContext(localctx, _startState, OpraFilterParser.RULE_expression);
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
          _alt = this._interp.adaptivePredict(this._input, 3, this._ctx);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.unrollRecursionContexts(_parentctx);
    }
    return localctx;
  }

  // @RuleVersion(0)
  public term(): TermContext {
    let localctx: TermContext = new TermContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, OpraFilterParser.RULE_term);
    try {
      this.state = 89;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case 42:
        case 43:
        case 44:
        case 45:
        case 46:
        case 47:
        case 48:
        case 49:
        case 51:
        case 52:
          localctx = new LiteralTermContext(this, localctx);
          this.enterOuterAlt(localctx, 1);
        {
          this.state = 86;
          this.literal();
        }
          break;
        case 50:
          localctx = new QualifiedIdentifierTermContext(this, localctx);
          this.enterOuterAlt(localctx, 2);
        {
          this.state = 87;
          this.qualifiedIdentifier();
        }
          break;
        case 23:
          localctx = new ExternalConstantTermContext(this, localctx);
          this.enterOuterAlt(localctx, 3);
        {
          this.state = 88;
          this.externalConstant();
        }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public invocable(): InvocableContext {
    let localctx: InvocableContext = new InvocableContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, OpraFilterParser.RULE_invocable);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 91;
        this.function_();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public invocation(): InvocationContext {
    let localctx: InvocationContext = new InvocationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, OpraFilterParser.RULE_invocation);
    try {
      localctx = new MemberInvocationContext(this, localctx);
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 93;
        this.identifier();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public indexer(): IndexerContext {
    let localctx: IndexerContext = new IndexerContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, OpraFilterParser.RULE_indexer);
    try {
      this.state = 97;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case 50:
          localctx = new MemberIndexContext(this, localctx);
          this.enterOuterAlt(localctx, 1);
        {
          this.state = 95;
          this.identifier();
        }
          break;
        case 53:
          localctx = new NumberIndexContext(this, localctx);
          this.enterOuterAlt(localctx, 2);
        {
          this.state = 96;
          this.match(OpraFilterParser.INTEGER);
        }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public function_(): FunctionContext {
    let localctx: FunctionContext = new FunctionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, OpraFilterParser.RULE_function);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 99;
        this.identifier();
        this.state = 100;
        this.match(OpraFilterParser.T__0);
        this.state = 102;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 8388618) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & 131011) !== 0)) {
          {
            this.state = 101;
            this.paramList();
          }
        }

        this.state = 104;
        this.match(OpraFilterParser.T__1);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public paramList(): ParamListContext {
    let localctx: ParamListContext = new ParamListContext(this, this._ctx, this.state);
    this.enterRule(localctx, 14, OpraFilterParser.RULE_paramList);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 106;
        this.expression(0);
        this.state = 111;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === 4) {
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
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public unit(): UnitContext {
    let localctx: UnitContext = new UnitContext(this, this._ctx, this.state);
    this.enterRule(localctx, 16, OpraFilterParser.RULE_unit);
    try {
      this.state = 117;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
          this.enterOuterAlt(localctx, 1);
        {
          this.state = 114;
          this.dateTimePrecision();
        }
          break;
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 21:
          this.enterOuterAlt(localctx, 2);
        {
          this.state = 115;
          this.pluralDateTimePrecision();
        }
          break;
        case 51:
          this.enterOuterAlt(localctx, 3);
        {
          this.state = 116;
          this.match(OpraFilterParser.STRING);
        }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public dateTimePrecision(): DateTimePrecisionContext {
    let localctx: DateTimePrecisionContext = new DateTimePrecisionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 18, OpraFilterParser.RULE_dateTimePrecision);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 119;
        _la = this._input.LA(1);
        if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & 16320) !== 0))) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public pluralDateTimePrecision(): PluralDateTimePrecisionContext {
    let localctx: PluralDateTimePrecisionContext = new PluralDateTimePrecisionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 20, OpraFilterParser.RULE_pluralDateTimePrecision);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 121;
        _la = this._input.LA(1);
        if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & 4177920) !== 0))) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public qualifiedIdentifier(): QualifiedIdentifierContext {
    let localctx: QualifiedIdentifierContext = new QualifiedIdentifierContext(this, this._ctx, this.state);
    this.enterRule(localctx, 22, OpraFilterParser.RULE_qualifiedIdentifier);
    try {
      let _alt: number;
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 128;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 9, this._ctx);
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
          _alt = this._interp.adaptivePredict(this._input, 9, this._ctx);
        }
        this.state = 131;
        this.identifier();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public externalConstant(): ExternalConstantContext {
    let localctx: ExternalConstantContext = new ExternalConstantContext(this, this._ctx, this.state);
    this.enterRule(localctx, 24, OpraFilterParser.RULE_externalConstant);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 133;
        this.match(OpraFilterParser.T__22);
        this.state = 134;
        _la = this._input.LA(1);
        if (!(_la === 50 || _la === 51)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public identifier(): IdentifierContext {
    let localctx: IdentifierContext = new IdentifierContext(this, this._ctx, this.state);
    this.enterRule(localctx, 26, OpraFilterParser.RULE_identifier);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 136;
        this.match(OpraFilterParser.IDENTIFIER);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public literal(): LiteralContext {
    let localctx: LiteralContext = new LiteralContext(this, this._ctx, this.state);
    this.enterRule(localctx, 28, OpraFilterParser.RULE_literal);
    try {
      this.state = 146;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case 52:
          localctx = new NumberLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 1);
        {
          this.state = 138;
          this.match(OpraFilterParser.NUMBER);
        }
          break;
        case 45:
        case 46:
          localctx = new InfinityLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 2);
        {
          this.state = 139;
          this.infinity();
        }
          break;
        case 42:
        case 43:
          localctx = new BooleanLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 3);
        {
          this.state = 140;
          this.boolean_();
        }
          break;
        case 44:
          localctx = new NullLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 4);
        {
          this.state = 141;
          this.null_();
        }
          break;
        case 47:
          localctx = new DateLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 5);
        {
          this.state = 142;
          this.match(OpraFilterParser.DATE);
        }
          break;
        case 48:
          localctx = new DateTimeLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 6);
        {
          this.state = 143;
          this.match(OpraFilterParser.DATETIME);
        }
          break;
        case 49:
          localctx = new TimeLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 7);
        {
          this.state = 144;
          this.match(OpraFilterParser.TIME);
        }
          break;
        case 51:
          localctx = new StringLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 8);
        {
          this.state = 145;
          this.match(OpraFilterParser.STRING);
        }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public compOp(): CompOpContext {
    let localctx: CompOpContext = new CompOpContext(this, this._ctx, this.state);
    this.enterRule(localctx, 30, OpraFilterParser.RULE_compOp);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 148;
        _la = this._input.LA(1);
        if (!(((((_la - 24)) & ~0x1F) === 0 && ((1 << (_la - 24)) & 4095) !== 0))) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public arthOp(): ArthOpContext {
    let localctx: ArthOpContext = new ArthOpContext(this, this._ctx, this.state);
    this.enterRule(localctx, 32, OpraFilterParser.RULE_arthOp);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 150;
        _la = this._input.LA(1);
        if (!(((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & 15) !== 0))) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public polarOp(): PolarOpContext {
    let localctx: PolarOpContext = new PolarOpContext(this, this._ctx, this.state);
    this.enterRule(localctx, 34, OpraFilterParser.RULE_polarOp);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 152;
        _la = this._input.LA(1);
        if (!(_la === 36 || _la === 37)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public logOp(): LogOpContext {
    let localctx: LogOpContext = new LogOpContext(this, this._ctx, this.state);
    this.enterRule(localctx, 36, OpraFilterParser.RULE_logOp);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 154;
        _la = this._input.LA(1);
        if (!(_la === 40 || _la === 41)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public boolean_(): BooleanContext {
    let localctx: BooleanContext = new BooleanContext(this, this._ctx, this.state);
    this.enterRule(localctx, 38, OpraFilterParser.RULE_boolean);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 156;
        _la = this._input.LA(1);
        if (!(_la === 42 || _la === 43)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public null_(): NullContext {
    let localctx: NullContext = new NullContext(this, this._ctx, this.state);
    this.enterRule(localctx, 40, OpraFilterParser.RULE_null);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 158;
        this.match(OpraFilterParser.T__43);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  // @RuleVersion(0)
  public infinity(): InfinityContext {
    let localctx: InfinityContext = new InfinityContext(this, this._ctx, this.state);
    this.enterRule(localctx, 42, OpraFilterParser.RULE_infinity);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 160;
        _la = this._input.LA(1);
        if (!(_la === 45 || _la === 46)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
    switch (ruleIndex) {
      case 1:
        return this.expression_sempred(localctx as ExpressionContext, predIndex);
    }
    return true;
  }

  private expression_sempred(localctx: ExpressionContext, predIndex: number): boolean {
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

  public static readonly _serializedATN: number[] = [4, 1, 56, 163, 2, 0, 7, 0, 2,
    1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2,
    10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7, 13, 2, 14, 7, 14, 2, 15, 7, 15, 2, 16, 7, 16, 2, 17,
    7, 17, 2, 18, 7, 18, 2, 19, 7, 19, 2, 20, 7, 20, 2, 21, 7, 21, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 61, 8, 1, 10, 1, 12, 1, 64, 9, 1, 1, 1, 1,
    1, 3, 1, 68, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 82, 8, 1,
    10, 1, 12, 1, 85, 9, 1, 1, 2, 1, 2, 1, 2, 3, 2, 90, 8, 2, 1, 3, 1, 3, 1, 4, 1, 4, 1, 5, 1, 5, 3, 5, 98,
    8, 5, 1, 6, 1, 6, 1, 6, 3, 6, 103, 8, 6, 1, 6, 1, 6, 1, 7, 1, 7, 1, 7, 5, 7, 110, 8, 7, 10, 7, 12, 7, 113,
    9, 7, 1, 8, 1, 8, 1, 8, 3, 8, 118, 8, 8, 1, 9, 1, 9, 1, 10, 1, 10, 1, 11, 1, 11, 1, 11, 5, 11, 127, 8,
    11, 10, 11, 12, 11, 130, 9, 11, 1, 11, 1, 11, 1, 12, 1, 12, 1, 12, 1, 13, 1, 13, 1, 14, 1, 14, 1,
    14, 1, 14, 1, 14, 1, 14, 1, 14, 1, 14, 3, 14, 147, 8, 14, 1, 15, 1, 15, 1, 16, 1, 16, 1, 17, 1, 17,
    1, 18, 1, 18, 1, 19, 1, 19, 1, 20, 1, 20, 1, 21, 1, 21, 1, 21, 0, 1, 2, 22, 0, 2, 4, 6, 8, 10, 12, 14,
    16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 0, 9, 1, 0, 6, 13, 1, 0, 14, 21, 1, 0, 50,
    51, 1, 0, 24, 35, 1, 0, 36, 39, 1, 0, 36, 37, 1, 0, 40, 41, 1, 0, 42, 43, 1, 0, 45, 46, 162, 0, 44,
    1, 0, 0, 0, 2, 67, 1, 0, 0, 0, 4, 89, 1, 0, 0, 0, 6, 91, 1, 0, 0, 0, 8, 93, 1, 0, 0, 0, 10, 97, 1, 0, 0,
    0, 12, 99, 1, 0, 0, 0, 14, 106, 1, 0, 0, 0, 16, 117, 1, 0, 0, 0, 18, 119, 1, 0, 0, 0, 20, 121, 1, 0,
    0, 0, 22, 128, 1, 0, 0, 0, 24, 133, 1, 0, 0, 0, 26, 136, 1, 0, 0, 0, 28, 146, 1, 0, 0, 0, 30, 148,
    1, 0, 0, 0, 32, 150, 1, 0, 0, 0, 34, 152, 1, 0, 0, 0, 36, 154, 1, 0, 0, 0, 38, 156, 1, 0, 0, 0, 40,
    158, 1, 0, 0, 0, 42, 160, 1, 0, 0, 0, 44, 45, 3, 2, 1, 0, 45, 46, 5, 0, 0, 1, 46, 1, 1, 0, 0, 0, 47,
    48, 6, 1, -1, 0, 48, 68, 3, 4, 2, 0, 49, 50, 3, 34, 17, 0, 50, 51, 3, 2, 1, 6, 51, 68, 1, 0, 0, 0, 52,
    53, 5, 1, 0, 0, 53, 54, 3, 2, 1, 0, 54, 55, 5, 2, 0, 0, 55, 68, 1, 0, 0, 0, 56, 57, 5, 3, 0, 0, 57, 62,
    3, 2, 1, 0, 58, 59, 5, 4, 0, 0, 59, 61, 3, 2, 1, 0, 60, 58, 1, 0, 0, 0, 61, 64, 1, 0, 0, 0, 62, 60, 1,
    0, 0, 0, 62, 63, 1, 0, 0, 0, 63, 65, 1, 0, 0, 0, 64, 62, 1, 0, 0, 0, 65, 66, 5, 5, 0, 0, 66, 68, 1, 0,
    0, 0, 67, 47, 1, 0, 0, 0, 67, 49, 1, 0, 0, 0, 67, 52, 1, 0, 0, 0, 67, 56, 1, 0, 0, 0, 68, 83, 1, 0, 0,
    0, 69, 70, 10, 5, 0, 0, 70, 71, 3, 32, 16, 0, 71, 72, 3, 2, 1, 6, 72, 82, 1, 0, 0, 0, 73, 74, 10, 4,
    0, 0, 74, 75, 3, 30, 15, 0, 75, 76, 3, 2, 1, 5, 76, 82, 1, 0, 0, 0, 77, 78, 10, 3, 0, 0, 78, 79, 3,
    36, 18, 0, 79, 80, 3, 2, 1, 4, 80, 82, 1, 0, 0, 0, 81, 69, 1, 0, 0, 0, 81, 73, 1, 0, 0, 0, 81, 77, 1,
    0, 0, 0, 82, 85, 1, 0, 0, 0, 83, 81, 1, 0, 0, 0, 83, 84, 1, 0, 0, 0, 84, 3, 1, 0, 0, 0, 85, 83, 1, 0,
    0, 0, 86, 90, 3, 28, 14, 0, 87, 90, 3, 22, 11, 0, 88, 90, 3, 24, 12, 0, 89, 86, 1, 0, 0, 0, 89, 87,
    1, 0, 0, 0, 89, 88, 1, 0, 0, 0, 90, 5, 1, 0, 0, 0, 91, 92, 3, 12, 6, 0, 92, 7, 1, 0, 0, 0, 93, 94, 3,
    26, 13, 0, 94, 9, 1, 0, 0, 0, 95, 98, 3, 26, 13, 0, 96, 98, 5, 53, 0, 0, 97, 95, 1, 0, 0, 0, 97, 96,
    1, 0, 0, 0, 98, 11, 1, 0, 0, 0, 99, 100, 3, 26, 13, 0, 100, 102, 5, 1, 0, 0, 101, 103, 3, 14, 7, 0,
    102, 101, 1, 0, 0, 0, 102, 103, 1, 0, 0, 0, 103, 104, 1, 0, 0, 0, 104, 105, 5, 2, 0, 0, 105, 13,
    1, 0, 0, 0, 106, 111, 3, 2, 1, 0, 107, 108, 5, 4, 0, 0, 108, 110, 3, 2, 1, 0, 109, 107, 1, 0, 0, 0,
    110, 113, 1, 0, 0, 0, 111, 109, 1, 0, 0, 0, 111, 112, 1, 0, 0, 0, 112, 15, 1, 0, 0, 0, 113, 111,
    1, 0, 0, 0, 114, 118, 3, 18, 9, 0, 115, 118, 3, 20, 10, 0, 116, 118, 5, 51, 0, 0, 117, 114, 1, 0,
    0, 0, 117, 115, 1, 0, 0, 0, 117, 116, 1, 0, 0, 0, 118, 17, 1, 0, 0, 0, 119, 120, 7, 0, 0, 0, 120,
    19, 1, 0, 0, 0, 121, 122, 7, 1, 0, 0, 122, 21, 1, 0, 0, 0, 123, 124, 3, 26, 13, 0, 124, 125, 5, 22,
    0, 0, 125, 127, 1, 0, 0, 0, 126, 123, 1, 0, 0, 0, 127, 130, 1, 0, 0, 0, 128, 126, 1, 0, 0, 0, 128,
    129, 1, 0, 0, 0, 129, 131, 1, 0, 0, 0, 130, 128, 1, 0, 0, 0, 131, 132, 3, 26, 13, 0, 132, 23, 1,
    0, 0, 0, 133, 134, 5, 23, 0, 0, 134, 135, 7, 2, 0, 0, 135, 25, 1, 0, 0, 0, 136, 137, 5, 50, 0, 0,
    137, 27, 1, 0, 0, 0, 138, 147, 5, 52, 0, 0, 139, 147, 3, 42, 21, 0, 140, 147, 3, 38, 19, 0, 141,
    147, 3, 40, 20, 0, 142, 147, 5, 47, 0, 0, 143, 147, 5, 48, 0, 0, 144, 147, 5, 49, 0, 0, 145, 147,
    5, 51, 0, 0, 146, 138, 1, 0, 0, 0, 146, 139, 1, 0, 0, 0, 146, 140, 1, 0, 0, 0, 146, 141, 1, 0, 0,
    0, 146, 142, 1, 0, 0, 0, 146, 143, 1, 0, 0, 0, 146, 144, 1, 0, 0, 0, 146, 145, 1, 0, 0, 0, 147, 29,
    1, 0, 0, 0, 148, 149, 7, 3, 0, 0, 149, 31, 1, 0, 0, 0, 150, 151, 7, 4, 0, 0, 151, 33, 1, 0, 0, 0, 152,
    153, 7, 5, 0, 0, 153, 35, 1, 0, 0, 0, 154, 155, 7, 6, 0, 0, 155, 37, 1, 0, 0, 0, 156, 157, 7, 7, 0,
    0, 157, 39, 1, 0, 0, 0, 158, 159, 5, 44, 0, 0, 159, 41, 1, 0, 0, 0, 160, 161, 7, 8, 0, 0, 161, 43,
    1, 0, 0, 0, 11, 62, 67, 81, 83, 89, 97, 102, 111, 117, 128, 146];

  private static __ATN: ATN;
  public static get _ATN(): ATN {
    if (!OpraFilterParser.__ATN) {
      OpraFilterParser.__ATN = new ATNDeserializer().deserialize(OpraFilterParser._serializedATN);
    }

    return OpraFilterParser.__ATN;
  }


  static DecisionsToDFA = OpraFilterParser._ATN.decisionToState.map((ds: DecisionState, index: number) => new DFA(ds, index));

}

export class RootContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
  }

  public EOF(): TerminalNode {
    return this.getToken(OpraFilterParser.EOF, 0);
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_root;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterRoot) {
      listener.enterRoot(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitRoot) {
      listener.exitRoot(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_expression;
  }

  public copyFrom(ctx: ExpressionContext): void {
    super.copyFrom(ctx);
  }
}

export class ParenthesizedExpressionContext extends ExpressionContext {
  constructor(parser: OpraFilterParser, ctx: ExpressionContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterParenthesizedExpression) {
      listener.enterParenthesizedExpression(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitParenthesizedExpression) {
      listener.exitParenthesizedExpression(this);
    }
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
  constructor(parser: OpraFilterParser, ctx: ExpressionContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public expression_list(): ExpressionContext[] {
    return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
  }

  public expression(i: number): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterArrayExpression) {
      listener.enterArrayExpression(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitArrayExpression) {
      listener.exitArrayExpression(this);
    }
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

export class PolarityExpressionContext extends ExpressionContext {
  constructor(parser: OpraFilterParser, ctx: ExpressionContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public polarOp(): PolarOpContext {
    return this.getTypedRuleContext(PolarOpContext, 0) as PolarOpContext;
  }

  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterPolarityExpression) {
      listener.enterPolarityExpression(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitPolarityExpression) {
      listener.exitPolarityExpression(this);
    }
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

export class ComparisonExpressionContext extends ExpressionContext {
  constructor(parser: OpraFilterParser, ctx: ExpressionContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public expression_list(): ExpressionContext[] {
    return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
  }

  public expression(i: number): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
  }

  public compOp(): CompOpContext {
    return this.getTypedRuleContext(CompOpContext, 0) as CompOpContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterComparisonExpression) {
      listener.enterComparisonExpression(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitComparisonExpression) {
      listener.exitComparisonExpression(this);
    }
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

export class ArithmeticExpressionContext extends ExpressionContext {
  constructor(parser: OpraFilterParser, ctx: ExpressionContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public expression_list(): ExpressionContext[] {
    return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
  }

  public expression(i: number): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
  }

  public arthOp(): ArthOpContext {
    return this.getTypedRuleContext(ArthOpContext, 0) as ArthOpContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterArithmeticExpression) {
      listener.enterArithmeticExpression(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitArithmeticExpression) {
      listener.exitArithmeticExpression(this);
    }
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

export class LogicalExpressionContext extends ExpressionContext {
  constructor(parser: OpraFilterParser, ctx: ExpressionContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public expression_list(): ExpressionContext[] {
    return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
  }

  public expression(i: number): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
  }

  public logOp(): LogOpContext {
    return this.getTypedRuleContext(LogOpContext, 0) as LogOpContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterLogicalExpression) {
      listener.enterLogicalExpression(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitLogicalExpression) {
      listener.exitLogicalExpression(this);
    }
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

export class TermExpressionContext extends ExpressionContext {
  constructor(parser: OpraFilterParser, ctx: ExpressionContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public term(): TermContext {
    return this.getTypedRuleContext(TermContext, 0) as TermContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterTermExpression) {
      listener.enterTermExpression(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitTermExpression) {
      listener.exitTermExpression(this);
    }
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


export class TermContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_term;
  }

  public copyFrom(ctx: TermContext): void {
    super.copyFrom(ctx);
  }
}

export class ExternalConstantTermContext extends TermContext {
  constructor(parser: OpraFilterParser, ctx: TermContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public externalConstant(): ExternalConstantContext {
    return this.getTypedRuleContext(ExternalConstantContext, 0) as ExternalConstantContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterExternalConstantTerm) {
      listener.enterExternalConstantTerm(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitExternalConstantTerm) {
      listener.exitExternalConstantTerm(this);
    }
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

export class LiteralTermContext extends TermContext {
  constructor(parser: OpraFilterParser, ctx: TermContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public literal(): LiteralContext {
    return this.getTypedRuleContext(LiteralContext, 0) as LiteralContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterLiteralTerm) {
      listener.enterLiteralTerm(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitLiteralTerm) {
      listener.exitLiteralTerm(this);
    }
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
  constructor(parser: OpraFilterParser, ctx: TermContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public qualifiedIdentifier(): QualifiedIdentifierContext {
    return this.getTypedRuleContext(QualifiedIdentifierContext, 0) as QualifiedIdentifierContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterQualifiedIdentifierTerm) {
      listener.enterQualifiedIdentifierTerm(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitQualifiedIdentifierTerm) {
      listener.exitQualifiedIdentifierTerm(this);
    }
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


export class InvocableContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public function_(): FunctionContext {
    return this.getTypedRuleContext(FunctionContext, 0) as FunctionContext;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_invocable;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterInvocable) {
      listener.enterInvocable(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitInvocable) {
      listener.exitInvocable(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_invocation;
  }

  public copyFrom(ctx: InvocationContext): void {
    super.copyFrom(ctx);
  }
}

export class MemberInvocationContext extends InvocationContext {
  constructor(parser: OpraFilterParser, ctx: InvocationContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public identifier(): IdentifierContext {
    return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterMemberInvocation) {
      listener.enterMemberInvocation(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitMemberInvocation) {
      listener.exitMemberInvocation(this);
    }
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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_indexer;
  }

  public copyFrom(ctx: IndexerContext): void {
    super.copyFrom(ctx);
  }
}

export class NumberIndexContext extends IndexerContext {
  constructor(parser: OpraFilterParser, ctx: IndexerContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public INTEGER(): TerminalNode {
    return this.getToken(OpraFilterParser.INTEGER, 0);
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterNumberIndex) {
      listener.enterNumberIndex(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitNumberIndex) {
      listener.exitNumberIndex(this);
    }
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

export class MemberIndexContext extends IndexerContext {
  constructor(parser: OpraFilterParser, ctx: IndexerContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public identifier(): IdentifierContext {
    return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterMemberIndex) {
      listener.enterMemberIndex(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitMemberIndex) {
      listener.exitMemberIndex(this);
    }
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


export class FunctionContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public identifier(): IdentifierContext {
    return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
  }

  public paramList(): ParamListContext {
    return this.getTypedRuleContext(ParamListContext, 0) as ParamListContext;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_function;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterFunction) {
      listener.enterFunction(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitFunction) {
      listener.exitFunction(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public expression_list(): ExpressionContext[] {
    return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
  }

  public expression(i: number): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_paramList;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterParamList) {
      listener.enterParamList(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitParamList) {
      listener.exitParamList(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public dateTimePrecision(): DateTimePrecisionContext {
    return this.getTypedRuleContext(DateTimePrecisionContext, 0) as DateTimePrecisionContext;
  }

  public pluralDateTimePrecision(): PluralDateTimePrecisionContext {
    return this.getTypedRuleContext(PluralDateTimePrecisionContext, 0) as PluralDateTimePrecisionContext;
  }

  public STRING(): TerminalNode {
    return this.getToken(OpraFilterParser.STRING, 0);
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_unit;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterUnit) {
      listener.enterUnit(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitUnit) {
      listener.exitUnit(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_dateTimePrecision;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterDateTimePrecision) {
      listener.enterDateTimePrecision(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitDateTimePrecision) {
      listener.exitDateTimePrecision(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_pluralDateTimePrecision;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterPluralDateTimePrecision) {
      listener.enterPluralDateTimePrecision(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitPluralDateTimePrecision) {
      listener.exitPluralDateTimePrecision(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public identifier_list(): IdentifierContext[] {
    return this.getTypedRuleContexts(IdentifierContext) as IdentifierContext[];
  }

  public identifier(i: number): IdentifierContext {
    return this.getTypedRuleContext(IdentifierContext, i) as IdentifierContext;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_qualifiedIdentifier;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterQualifiedIdentifier) {
      listener.enterQualifiedIdentifier(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitQualifiedIdentifier) {
      listener.exitQualifiedIdentifier(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public IDENTIFIER(): TerminalNode {
    return this.getToken(OpraFilterParser.IDENTIFIER, 0);
  }

  public STRING(): TerminalNode {
    return this.getToken(OpraFilterParser.STRING, 0);
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_externalConstant;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterExternalConstant) {
      listener.enterExternalConstant(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitExternalConstant) {
      listener.exitExternalConstant(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public IDENTIFIER(): TerminalNode {
    return this.getToken(OpraFilterParser.IDENTIFIER, 0);
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_identifier;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterIdentifier) {
      listener.enterIdentifier(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitIdentifier) {
      listener.exitIdentifier(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_literal;
  }

  public copyFrom(ctx: LiteralContext): void {
    super.copyFrom(ctx);
  }
}

export class TimeLiteralContext extends LiteralContext {
  constructor(parser: OpraFilterParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public TIME(): TerminalNode {
    return this.getToken(OpraFilterParser.TIME, 0);
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterTimeLiteral) {
      listener.enterTimeLiteral(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitTimeLiteral) {
      listener.exitTimeLiteral(this);
    }
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

export class NullLiteralContext extends LiteralContext {
  constructor(parser: OpraFilterParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public null_(): NullContext {
    return this.getTypedRuleContext(NullContext, 0) as NullContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterNullLiteral) {
      listener.enterNullLiteral(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitNullLiteral) {
      listener.exitNullLiteral(this);
    }
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

export class DateTimeLiteralContext extends LiteralContext {
  constructor(parser: OpraFilterParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public DATETIME(): TerminalNode {
    return this.getToken(OpraFilterParser.DATETIME, 0);
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterDateTimeLiteral) {
      listener.enterDateTimeLiteral(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitDateTimeLiteral) {
      listener.exitDateTimeLiteral(this);
    }
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

export class StringLiteralContext extends LiteralContext {
  constructor(parser: OpraFilterParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public STRING(): TerminalNode {
    return this.getToken(OpraFilterParser.STRING, 0);
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterStringLiteral) {
      listener.enterStringLiteral(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitStringLiteral) {
      listener.exitStringLiteral(this);
    }
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

export class DateLiteralContext extends LiteralContext {
  constructor(parser: OpraFilterParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public DATE(): TerminalNode {
    return this.getToken(OpraFilterParser.DATE, 0);
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterDateLiteral) {
      listener.enterDateLiteral(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitDateLiteral) {
      listener.exitDateLiteral(this);
    }
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

export class InfinityLiteralContext extends LiteralContext {
  constructor(parser: OpraFilterParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public infinity(): InfinityContext {
    return this.getTypedRuleContext(InfinityContext, 0) as InfinityContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterInfinityLiteral) {
      listener.enterInfinityLiteral(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitInfinityLiteral) {
      listener.exitInfinityLiteral(this);
    }
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
  constructor(parser: OpraFilterParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public boolean_(): BooleanContext {
    return this.getTypedRuleContext(BooleanContext, 0) as BooleanContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterBooleanLiteral) {
      listener.enterBooleanLiteral(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitBooleanLiteral) {
      listener.exitBooleanLiteral(this);
    }
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

export class NumberLiteralContext extends LiteralContext {
  constructor(parser: OpraFilterParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public NUMBER(): TerminalNode {
    return this.getToken(OpraFilterParser.NUMBER, 0);
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterNumberLiteral) {
      listener.enterNumberLiteral(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitNumberLiteral) {
      listener.exitNumberLiteral(this);
    }
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


export class CompOpContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_compOp;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterCompOp) {
      listener.enterCompOp(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitCompOp) {
      listener.exitCompOp(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_arthOp;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterArthOp) {
      listener.enterArthOp(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitArthOp) {
      listener.exitArthOp(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_polarOp;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterPolarOp) {
      listener.enterPolarOp(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitPolarOp) {
      listener.exitPolarOp(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_logOp;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterLogOp) {
      listener.enterLogOp(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitLogOp) {
      listener.exitLogOp(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_boolean;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterBoolean) {
      listener.enterBoolean(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitBoolean) {
      listener.exitBoolean(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_null;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterNull) {
      listener.enterNull(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitNull) {
      listener.exitNull(this);
    }
  }

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
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_infinity;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterInfinity) {
      listener.enterInfinity(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitInfinity) {
      listener.exitInfinity(this);
    }
  }

  // @Override
  public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
    if (visitor.visitInfinity) {
      return visitor.visitInfinity(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
