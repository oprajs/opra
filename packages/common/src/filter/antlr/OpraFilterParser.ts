/* eslint-disable camelcase,no-bitwise */
// Generated from ./src/filter/antlr/OpraFilter.g4 by ANTLR 4.12.0
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
  ATN,
  ATNDeserializer,
  DecisionState, DFA, FailedPredicateException,
  NoViableAltException, Parser, ParserATNSimulator,
  ParserRuleContext, PredictionContextCache,
  RecognitionException, RuleContext,
  TerminalNode, Token, TokenStream
} from '@browsery/antlr4';
import type OpraFilterListener from "./OpraFilterListener.js";
import type OpraFilterVisitor from "./OpraFilterVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
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
  public static readonly IDENTIFIER = 35;
  public static readonly POLAR_OP = 36;
  public static readonly DATE = 37;
  public static readonly DATETIME = 38;
  public static readonly TIME = 39;
  public static readonly NUMBER = 40;
  public static readonly INTEGER = 41;
  public static readonly STRING = 42;
  public static readonly WHITESPACE = 43;
  public static readonly EOF = Token.EOF;
  public static readonly RULE_root = 0;
  public static readonly RULE_expression = 1;
  public static readonly RULE_comparisonLeft = 2;
  public static readonly RULE_comparisonRight = 3;
  public static readonly RULE_parenthesizedItem = 4;
  public static readonly RULE_value = 5;
  public static readonly RULE_qualifiedIdentifier = 6;
  public static readonly RULE_externalConstant = 7;
  public static readonly RULE_identifier = 8;
  public static readonly RULE_arrayValue = 9;
  public static readonly RULE_boolean = 10;
  public static readonly RULE_null = 11;
  public static readonly RULE_infinity = 12;
  public static readonly RULE_arithmeticOperator = 13;
  public static readonly RULE_comparisonOperator = 14;
  public static readonly RULE_logicalOperator = 15;
  public static readonly RULE_polarityOperator = 16;
  public static readonly literalNames: (string | null)[] = [null, "'('",
    "')'", "'not'",
    "'!'", "'.'",
    "'@'", "'['",
    "','", "']'",
    "'true'", "'false'",
    "'null'", "'Infinity'",
    "'infinity'",
    "'+'", "'-'",
    "'*'", "'/'",
    "'<='", "'<'",
    "'>'", "'>='",
    "'='", "'!='",
    "'in'", "'!in'",
    "'like'", "'!like'",
    "'ilike'", "'!ilike'",
    "'and'", "'or'",
    "'&&'", "'||'"];
  public static readonly symbolicNames: (string | null)[] = [null, null,
    null, null,
    null, null,
    null, null,
    null, null,
    null, null,
    null, null,
    null, null,
    null, null,
    null, null,
    null, null,
    null, null,
    null, null,
    null, null,
    null, null,
    null, null,
    null, null,
    null, "IDENTIFIER",
    "POLAR_OP",
    "DATE", "DATETIME",
    "TIME", "NUMBER",
    "INTEGER",
    "STRING", "WHITESPACE"];
  // tslint:disable:no-trailing-whitespace
  public static readonly ruleNames: string[] = [
    "root", "expression", "comparisonLeft", "comparisonRight", "parenthesizedItem",
    "value", "qualifiedIdentifier", "externalConstant", "identifier", "arrayValue",
    "boolean", "null", "infinity", "arithmeticOperator", "comparisonOperator",
    "logicalOperator", "polarityOperator",
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
    const localctx: RootContext = new RootContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, OpraFilterParser.RULE_root);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 34;
        this.expression(0);
        this.state = 35;
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

    const _parentctx: ParserRuleContext = this._ctx;
    const _parentState: number = this.state;
    let localctx: ExpressionContext = new ExpressionContext(this, this._ctx, _parentState);
    let _prevctx: ExpressionContext = localctx;
    const _startState: number = 2;
    this.enterRecursionRule(localctx, 2, OpraFilterParser.RULE_expression, _p);
    let _la: number;
    try {
      let _alt: number;
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 48;
        this._errHandler.sync(this);
        switch (this._input.LA(1)) {
          case 35: {
            localctx = new ComparisonExpressionContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;

            this.state = 38;
            (localctx as ComparisonExpressionContext)._left = this.comparisonLeft();
            this.state = 39;
            (localctx as ComparisonExpressionContext)._operator = this.comparisonOperator();
            this.state = 40;
            (localctx as ComparisonExpressionContext)._right = this.comparisonRight();
          }
            break;
          case 1: {
            localctx = new ParenthesizedExpressionContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 42;
            this.match(OpraFilterParser.T__0);
            this.state = 43;
            this.parenthesizedItem();
            this.state = 44;
            this.match(OpraFilterParser.T__1);
          }
            break;
          case 3:
          case 4: {
            localctx = new NegativeExpressionContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 46;
            _la = this._input.LA(1);
            if (!(_la === 3 || _la === 4)) {
              this._errHandler.recoverInline(this);
            } else {
              this._errHandler.reportMatch(this);
              this.consume();
            }
            this.state = 47;
            this.expression(1);
          }
            break;
          default:
            throw new NoViableAltException(this);
        }
        this._ctx.stop = this._input.LT(-1);
        this.state = 56;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 1, this._ctx);
        while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            if (this._parseListeners != null) {
              this.triggerExitRuleEvent();
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _prevctx = localctx;
            {
              {
                localctx = new LogicalExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                this.pushNewRecursionContext(localctx, _startState, OpraFilterParser.RULE_expression);
                this.state = 50;
                if (!(this.precpred(this._ctx, 3))) {
                  throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
                }
                this.state = 51;
                (localctx as LogicalExpressionContext)._op = this.logicalOperator();
                this.state = 52;
                this.expression(4);
              }
            }
          }
          this.state = 58;
          this._errHandler.sync(this);
          _alt = this._interp.adaptivePredict(this._input, 1, this._ctx);
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
  public comparisonLeft(): ComparisonLeftContext {
    const localctx: ComparisonLeftContext = new ComparisonLeftContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, OpraFilterParser.RULE_comparisonLeft);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 59;
        this.qualifiedIdentifier();
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
  public comparisonRight(): ComparisonRightContext {
    const localctx: ComparisonRightContext = new ComparisonRightContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, OpraFilterParser.RULE_comparisonRight);
    try {
      this.state = 65;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
        case 37:
        case 38:
        case 39:
        case 40:
        case 42:
          this.enterOuterAlt(localctx, 1);
        {
          this.state = 61;
          this.value();
        }
          break;
        case 35:
          this.enterOuterAlt(localctx, 2);
        {
          this.state = 62;
          this.qualifiedIdentifier();
        }
          break;
        case 6:
          this.enterOuterAlt(localctx, 3);
        {
          this.state = 63;
          this.externalConstant();
        }
          break;
        case 7:
          this.enterOuterAlt(localctx, 4);
        {
          this.state = 64;
          this.arrayValue();
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
  public parenthesizedItem(): ParenthesizedItemContext {
    const localctx: ParenthesizedItemContext = new ParenthesizedItemContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, OpraFilterParser.RULE_parenthesizedItem);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 67;
        this.expression(0);
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
  public value(): ValueContext {
    let localctx: ValueContext = new ValueContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, OpraFilterParser.RULE_value);
    try {
      this.state = 77;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case 40:
          localctx = new NumberLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 1);
        {
          this.state = 69;
          this.match(OpraFilterParser.NUMBER);
        }
          break;
        case 13:
        case 14:
          localctx = new InfinityLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 2);
        {
          this.state = 70;
          this.infinity();
        }
          break;
        case 10:
        case 11:
          localctx = new BooleanLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 3);
        {
          this.state = 71;
          this.boolean_();
        }
          break;
        case 12:
          localctx = new NullLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 4);
        {
          this.state = 72;
          this.null_();
        }
          break;
        case 37:
          localctx = new DateLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 5);
        {
          this.state = 73;
          this.match(OpraFilterParser.DATE);
        }
          break;
        case 38:
          localctx = new DateTimeLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 6);
        {
          this.state = 74;
          this.match(OpraFilterParser.DATETIME);
        }
          break;
        case 39:
          localctx = new TimeLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 7);
        {
          this.state = 75;
          this.match(OpraFilterParser.TIME);
        }
          break;
        case 42:
          localctx = new StringLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 8);
        {
          this.state = 76;
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
  public qualifiedIdentifier(): QualifiedIdentifierContext {
    const localctx: QualifiedIdentifierContext = new QualifiedIdentifierContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, OpraFilterParser.RULE_qualifiedIdentifier);
    try {
      let _alt: number;
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 84;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 4, this._ctx);
        while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            {
              {
                this.state = 79;
                this.identifier();
                this.state = 80;
                this.match(OpraFilterParser.T__4);
              }
            }
          }
          this.state = 86;
          this._errHandler.sync(this);
          _alt = this._interp.adaptivePredict(this._input, 4, this._ctx);
        }
        this.state = 87;
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
    const localctx: ExternalConstantContext = new ExternalConstantContext(this, this._ctx, this.state);
    this.enterRule(localctx, 14, OpraFilterParser.RULE_externalConstant);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 89;
        this.match(OpraFilterParser.T__5);
        this.state = 90;
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
  public identifier(): IdentifierContext {
    const localctx: IdentifierContext = new IdentifierContext(this, this._ctx, this.state);
    this.enterRule(localctx, 16, OpraFilterParser.RULE_identifier);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 92;
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
  public arrayValue(): ArrayValueContext {
    const localctx: ArrayValueContext = new ArrayValueContext(this, this._ctx, this.state);
    this.enterRule(localctx, 18, OpraFilterParser.RULE_arrayValue);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 94;
        this.match(OpraFilterParser.T__6);
        this.state = 95;
        this.value();
        this.state = 100;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === 8) {
          {
            {
              this.state = 96;
              this.match(OpraFilterParser.T__7);
              this.state = 97;
              this.value();
            }
          }
          this.state = 102;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
        this.state = 103;
        this.match(OpraFilterParser.T__8);
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
    const localctx: BooleanContext = new BooleanContext(this, this._ctx, this.state);
    this.enterRule(localctx, 20, OpraFilterParser.RULE_boolean);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 105;
        _la = this._input.LA(1);
        if (!(_la === 10 || _la === 11)) {
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
    const localctx: NullContext = new NullContext(this, this._ctx, this.state);
    this.enterRule(localctx, 22, OpraFilterParser.RULE_null);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 107;
        this.match(OpraFilterParser.T__11);
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
    const localctx: InfinityContext = new InfinityContext(this, this._ctx, this.state);
    this.enterRule(localctx, 24, OpraFilterParser.RULE_infinity);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 109;
        _la = this._input.LA(1);
        if (!(_la === 13 || _la === 14)) {
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
  public arithmeticOperator(): ArithmeticOperatorContext {
    const localctx: ArithmeticOperatorContext = new ArithmeticOperatorContext(this, this._ctx, this.state);
    this.enterRule(localctx, 26, OpraFilterParser.RULE_arithmeticOperator);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 111;
        _la = this._input.LA(1);
        if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & 491520) !== 0))) {
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
  public comparisonOperator(): ComparisonOperatorContext {
    const localctx: ComparisonOperatorContext = new ComparisonOperatorContext(this, this._ctx, this.state);
    this.enterRule(localctx, 28, OpraFilterParser.RULE_comparisonOperator);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 113;
        _la = this._input.LA(1);
        if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & 2146959360) !== 0))) {
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
  public logicalOperator(): LogicalOperatorContext {
    const localctx: LogicalOperatorContext = new LogicalOperatorContext(this, this._ctx, this.state);
    this.enterRule(localctx, 30, OpraFilterParser.RULE_logicalOperator);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 115;
        _la = this._input.LA(1);
        if (!(((((_la - 31)) & ~0x1F) === 0 && ((1 << (_la - 31)) & 15) !== 0))) {
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
  public polarityOperator(): PolarityOperatorContext {
    const localctx: PolarityOperatorContext = new PolarityOperatorContext(this, this._ctx, this.state);
    this.enterRule(localctx, 32, OpraFilterParser.RULE_polarityOperator);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 117;
        this.match(OpraFilterParser.POLAR_OP);
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
        return this.precpred(this._ctx, 3);
    }
    return true;
  }

  public static readonly _serializedATN: number[] = [4, 1, 43, 120, 2, 0, 7, 0, 2,
    1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2,
    10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7, 13, 2, 14, 7, 14, 2, 15, 7, 15, 2, 16, 7, 16, 1, 0,
    1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 49, 8, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 5, 1, 55, 8, 1, 10, 1, 12, 1, 58, 9, 1, 1, 2, 1, 2, 1, 3, 1, 3, 1, 3, 1, 3, 3, 3, 66, 8, 3,
    1, 4, 1, 4, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 3, 5, 78, 8, 5, 1, 6, 1, 6, 1, 6, 5, 6, 83, 8,
    6, 10, 6, 12, 6, 86, 9, 6, 1, 6, 1, 6, 1, 7, 1, 7, 1, 7, 1, 8, 1, 8, 1, 9, 1, 9, 1, 9, 1, 9, 5, 9, 99, 8,
    9, 10, 9, 12, 9, 102, 9, 9, 1, 9, 1, 9, 1, 10, 1, 10, 1, 11, 1, 11, 1, 12, 1, 12, 1, 13, 1, 13, 1, 14,
    1, 14, 1, 15, 1, 15, 1, 16, 1, 16, 1, 16, 0, 1, 2, 17, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24,
    26, 28, 30, 32, 0, 6, 1, 0, 3, 4, 1, 0, 10, 11, 1, 0, 13, 14, 1, 0, 15, 18, 1, 0, 19, 30, 1, 0, 31,
    34, 117, 0, 34, 1, 0, 0, 0, 2, 48, 1, 0, 0, 0, 4, 59, 1, 0, 0, 0, 6, 65, 1, 0, 0, 0, 8, 67, 1, 0, 0, 0,
    10, 77, 1, 0, 0, 0, 12, 84, 1, 0, 0, 0, 14, 89, 1, 0, 0, 0, 16, 92, 1, 0, 0, 0, 18, 94, 1, 0, 0, 0, 20,
    105, 1, 0, 0, 0, 22, 107, 1, 0, 0, 0, 24, 109, 1, 0, 0, 0, 26, 111, 1, 0, 0, 0, 28, 113, 1, 0, 0, 0,
    30, 115, 1, 0, 0, 0, 32, 117, 1, 0, 0, 0, 34, 35, 3, 2, 1, 0, 35, 36, 5, 0, 0, 1, 36, 1, 1, 0, 0, 0,
    37, 38, 6, 1, -1, 0, 38, 39, 3, 4, 2, 0, 39, 40, 3, 28, 14, 0, 40, 41, 3, 6, 3, 0, 41, 49, 1, 0, 0,
    0, 42, 43, 5, 1, 0, 0, 43, 44, 3, 8, 4, 0, 44, 45, 5, 2, 0, 0, 45, 49, 1, 0, 0, 0, 46, 47, 7, 0, 0, 0,
    47, 49, 3, 2, 1, 1, 48, 37, 1, 0, 0, 0, 48, 42, 1, 0, 0, 0, 48, 46, 1, 0, 0, 0, 49, 56, 1, 0, 0, 0, 50,
    51, 10, 3, 0, 0, 51, 52, 3, 30, 15, 0, 52, 53, 3, 2, 1, 4, 53, 55, 1, 0, 0, 0, 54, 50, 1, 0, 0, 0, 55,
    58, 1, 0, 0, 0, 56, 54, 1, 0, 0, 0, 56, 57, 1, 0, 0, 0, 57, 3, 1, 0, 0, 0, 58, 56, 1, 0, 0, 0, 59, 60,
    3, 12, 6, 0, 60, 5, 1, 0, 0, 0, 61, 66, 3, 10, 5, 0, 62, 66, 3, 12, 6, 0, 63, 66, 3, 14, 7, 0, 64, 66,
    3, 18, 9, 0, 65, 61, 1, 0, 0, 0, 65, 62, 1, 0, 0, 0, 65, 63, 1, 0, 0, 0, 65, 64, 1, 0, 0, 0, 66, 7, 1,
    0, 0, 0, 67, 68, 3, 2, 1, 0, 68, 9, 1, 0, 0, 0, 69, 78, 5, 40, 0, 0, 70, 78, 3, 24, 12, 0, 71, 78, 3,
    20, 10, 0, 72, 78, 3, 22, 11, 0, 73, 78, 5, 37, 0, 0, 74, 78, 5, 38, 0, 0, 75, 78, 5, 39, 0, 0, 76,
    78, 5, 42, 0, 0, 77, 69, 1, 0, 0, 0, 77, 70, 1, 0, 0, 0, 77, 71, 1, 0, 0, 0, 77, 72, 1, 0, 0, 0, 77,
    73, 1, 0, 0, 0, 77, 74, 1, 0, 0, 0, 77, 75, 1, 0, 0, 0, 77, 76, 1, 0, 0, 0, 78, 11, 1, 0, 0, 0, 79, 80,
    3, 16, 8, 0, 80, 81, 5, 5, 0, 0, 81, 83, 1, 0, 0, 0, 82, 79, 1, 0, 0, 0, 83, 86, 1, 0, 0, 0, 84, 82,
    1, 0, 0, 0, 84, 85, 1, 0, 0, 0, 85, 87, 1, 0, 0, 0, 86, 84, 1, 0, 0, 0, 87, 88, 3, 16, 8, 0, 88, 13,
    1, 0, 0, 0, 89, 90, 5, 6, 0, 0, 90, 91, 3, 16, 8, 0, 91, 15, 1, 0, 0, 0, 92, 93, 5, 35, 0, 0, 93, 17,
    1, 0, 0, 0, 94, 95, 5, 7, 0, 0, 95, 100, 3, 10, 5, 0, 96, 97, 5, 8, 0, 0, 97, 99, 3, 10, 5, 0, 98, 96,
    1, 0, 0, 0, 99, 102, 1, 0, 0, 0, 100, 98, 1, 0, 0, 0, 100, 101, 1, 0, 0, 0, 101, 103, 1, 0, 0, 0, 102,
    100, 1, 0, 0, 0, 103, 104, 5, 9, 0, 0, 104, 19, 1, 0, 0, 0, 105, 106, 7, 1, 0, 0, 106, 21, 1, 0, 0,
    0, 107, 108, 5, 12, 0, 0, 108, 23, 1, 0, 0, 0, 109, 110, 7, 2, 0, 0, 110, 25, 1, 0, 0, 0, 111, 112,
    7, 3, 0, 0, 112, 27, 1, 0, 0, 0, 113, 114, 7, 4, 0, 0, 114, 29, 1, 0, 0, 0, 115, 116, 7, 5, 0, 0, 116,
    31, 1, 0, 0, 0, 117, 118, 5, 36, 0, 0, 118, 33, 1, 0, 0, 0, 6, 48, 56, 65, 77, 84, 100];

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

  public parenthesizedItem(): ParenthesizedItemContext {
    return this.getTypedRuleContext(ParenthesizedItemContext, 0) as ParenthesizedItemContext;
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

export class NegativeExpressionContext extends ExpressionContext {
  constructor(parser: OpraFilterParser, ctx: ExpressionContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterNegativeExpression) {
      listener.enterNegativeExpression(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitNegativeExpression) {
      listener.exitNegativeExpression(this);
    }
  }

  // @Override
  public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
    if (visitor.visitNegativeExpression) {
      return visitor.visitNegativeExpression(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class ComparisonExpressionContext extends ExpressionContext {
  public _left!: ComparisonLeftContext;
  public _operator!: ComparisonOperatorContext;
  public _right!: ComparisonRightContext;

  constructor(parser: OpraFilterParser, ctx: ExpressionContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }

  public comparisonLeft(): ComparisonLeftContext {
    return this.getTypedRuleContext(ComparisonLeftContext, 0) as ComparisonLeftContext;
  }

  public comparisonOperator(): ComparisonOperatorContext {
    return this.getTypedRuleContext(ComparisonOperatorContext, 0) as ComparisonOperatorContext;
  }

  public comparisonRight(): ComparisonRightContext {
    return this.getTypedRuleContext(ComparisonRightContext, 0) as ComparisonRightContext;
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

export class LogicalExpressionContext extends ExpressionContext {
  public _op!: LogicalOperatorContext;

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

  public logicalOperator(): LogicalOperatorContext {
    return this.getTypedRuleContext(LogicalOperatorContext, 0) as LogicalOperatorContext;
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


export class ComparisonLeftContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public qualifiedIdentifier(): QualifiedIdentifierContext {
    return this.getTypedRuleContext(QualifiedIdentifierContext, 0) as QualifiedIdentifierContext;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_comparisonLeft;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterComparisonLeft) {
      listener.enterComparisonLeft(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitComparisonLeft) {
      listener.exitComparisonLeft(this);
    }
  }

  // @Override
  public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
    if (visitor.visitComparisonLeft) {
      return visitor.visitComparisonLeft(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class ComparisonRightContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public value(): ValueContext {
    return this.getTypedRuleContext(ValueContext, 0) as ValueContext;
  }

  public qualifiedIdentifier(): QualifiedIdentifierContext {
    return this.getTypedRuleContext(QualifiedIdentifierContext, 0) as QualifiedIdentifierContext;
  }

  public externalConstant(): ExternalConstantContext {
    return this.getTypedRuleContext(ExternalConstantContext, 0) as ExternalConstantContext;
  }

  public arrayValue(): ArrayValueContext {
    return this.getTypedRuleContext(ArrayValueContext, 0) as ArrayValueContext;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_comparisonRight;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterComparisonRight) {
      listener.enterComparisonRight(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitComparisonRight) {
      listener.exitComparisonRight(this);
    }
  }

  // @Override
  public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
    if (visitor.visitComparisonRight) {
      return visitor.visitComparisonRight(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class ParenthesizedItemContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_parenthesizedItem;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterParenthesizedItem) {
      listener.enterParenthesizedItem(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitParenthesizedItem) {
      listener.exitParenthesizedItem(this);
    }
  }

  // @Override
  public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
    if (visitor.visitParenthesizedItem) {
      return visitor.visitParenthesizedItem(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class ValueContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_value;
  }

  public copyFrom(ctx: ValueContext): void {
    super.copyFrom(ctx);
  }
}

export class TimeLiteralContext extends ValueContext {
  constructor(parser: OpraFilterParser, ctx: ValueContext) {
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

export class NullLiteralContext extends ValueContext {
  constructor(parser: OpraFilterParser, ctx: ValueContext) {
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

export class DateTimeLiteralContext extends ValueContext {
  constructor(parser: OpraFilterParser, ctx: ValueContext) {
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

export class StringLiteralContext extends ValueContext {
  constructor(parser: OpraFilterParser, ctx: ValueContext) {
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

export class DateLiteralContext extends ValueContext {
  constructor(parser: OpraFilterParser, ctx: ValueContext) {
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

export class InfinityLiteralContext extends ValueContext {
  constructor(parser: OpraFilterParser, ctx: ValueContext) {
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

export class BooleanLiteralContext extends ValueContext {
  constructor(parser: OpraFilterParser, ctx: ValueContext) {
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

export class NumberLiteralContext extends ValueContext {
  constructor(parser: OpraFilterParser, ctx: ValueContext) {
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

  public identifier(): IdentifierContext {
    return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
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


export class ArrayValueContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public value_list(): ValueContext[] {
    return this.getTypedRuleContexts(ValueContext) as ValueContext[];
  }

  public value(i: number): ValueContext {
    return this.getTypedRuleContext(ValueContext, i) as ValueContext;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_arrayValue;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterArrayValue) {
      listener.enterArrayValue(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitArrayValue) {
      listener.exitArrayValue(this);
    }
  }

  // @Override
  public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
    if (visitor.visitArrayValue) {
      return visitor.visitArrayValue(this);
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


export class ArithmeticOperatorContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_arithmeticOperator;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterArithmeticOperator) {
      listener.enterArithmeticOperator(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitArithmeticOperator) {
      listener.exitArithmeticOperator(this);
    }
  }

  // @Override
  public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
    if (visitor.visitArithmeticOperator) {
      return visitor.visitArithmeticOperator(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class ComparisonOperatorContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_comparisonOperator;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterComparisonOperator) {
      listener.enterComparisonOperator(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitComparisonOperator) {
      listener.exitComparisonOperator(this);
    }
  }

  // @Override
  public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
    if (visitor.visitComparisonOperator) {
      return visitor.visitComparisonOperator(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class LogicalOperatorContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_logicalOperator;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterLogicalOperator) {
      listener.enterLogicalOperator(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitLogicalOperator) {
      listener.exitLogicalOperator(this);
    }
  }

  // @Override
  public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
    if (visitor.visitLogicalOperator) {
      return visitor.visitLogicalOperator(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class PolarityOperatorContext extends ParserRuleContext {
  constructor(parser?: OpraFilterParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }

  public POLAR_OP(): TerminalNode {
    return this.getToken(OpraFilterParser.POLAR_OP, 0);
  }

  public get ruleIndex(): number {
    return OpraFilterParser.RULE_polarityOperator;
  }

  public enterRule(listener: OpraFilterListener): void {
    if (listener.enterPolarityOperator) {
      listener.enterPolarityOperator(this);
    }
  }

  public exitRule(listener: OpraFilterListener): void {
    if (listener.exitPolarityOperator) {
      listener.exitPolarityOperator(this);
    }
  }

  // @Override
  public accept<Result>(visitor: OpraFilterVisitor<Result>): Result {
    if (visitor.visitPolarityOperator) {
      return visitor.visitPolarityOperator(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
