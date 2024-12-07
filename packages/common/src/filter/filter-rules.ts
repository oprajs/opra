import '../polifils/array-find-last.js';
import { omitUndefined } from '@jsopen/objects';
import type { StrictOmit } from 'ts-gems';
import { isString, Validator } from 'valgen';
import type { ComplexType } from '../document/index.js';
import { OpraException } from '../exception/index.js';
import { ResponsiveMap } from '../helpers/index.js';
import { translate } from '../i18n/index.js';
import { OpraSchema } from '../schema/index.js';
import {
  ArithmeticExpression,
  ArrayExpression,
  ComparisonExpression,
  type ComparisonOperator,
  Expression,
  Literal,
  LogicalExpression,
  ParenthesizedExpression,
  QualifiedIdentifier,
} from './ast/index.js';
import { parse } from './parse.js';

export namespace FilterRules {
  export interface Options {
    caseSensitive?: boolean;
  }

  export interface Rule {
    operators?: ComparisonOperator[];
    description?: string;
  }
}

export class FilterRules {
  protected _rules = new ResponsiveMap<FilterRules.Rule>();
  protected _decoderCache = new WeakMap<any, Validator>();

  constructor(
    rules?: Record<string, FilterRules.Rule>,
    options?: FilterRules.Options,
  ) {
    Object.defineProperty(this, '_rules', {
      value: new ResponsiveMap(null, { caseSensitive: options?.caseSensitive }),
      enumerable: false,
    });
    if (rules) {
      for (const [k, v] of Object.entries(rules)) {
        this.set(k, v);
      }
    }
  }

  set(
    fieldName: string,
    options?: Partial<StrictOmit<FilterRules.Rule, 'operators'>> & {
      operators?: ComparisonOperator[] | string;
    },
  ) {
    const operators =
      typeof options?.operators === 'string'
        ? (options.operators.split(/\s*[,| ]\s*/) as ComparisonOperator[])
        : options?.operators;
    this._rules.set(
      fieldName,
      omitUndefined<FilterRules.Rule>({
        ...options,
        operators,
      }),
    );
  }

  normalizeFilter(
    filter: OpraSchema.Field.QualifiedName | Expression,
    currentType?: ComplexType,
  ): Expression | undefined {
    const ast = typeof filter === 'string' ? parse(filter) : filter;
    return this.normalizeFilterAst(ast, [], currentType);
  }

  protected normalizeFilterAst(
    ast: Expression,
    stack: Expression[],
    currentType?: ComplexType,
  ): Expression | undefined {
    if (ast instanceof ComparisonExpression) {
      stack.push(ast);
      this.normalizeFilterAst(ast.left, stack, currentType);

      if (!(ast.left instanceof QualifiedIdentifier && ast.left.field)) {
        throw new TypeError(
          `Invalid filter query. Left side should be a data field.`,
        );
      }
      // Check if filtering accepted for given field
      // const findManyOp = this.getOperation('findMany');
      const rule = this._rules.get(ast.left.value);
      if (!rule) {
        throw new OpraException({
          message: translate('error:UNACCEPTED_FILTER_FIELD', {
            field: ast.left.value,
          }),
          code: 'UNACCEPTED_FILTER_FIELD',
          details: {
            field: ast.left.value,
          },
        });
      }
      // Check if filtering endpoint accepted for given field
      if (rule.operators && !rule.operators.includes(ast.op)) {
        throw new OpraException({
          message: translate('error:UNACCEPTED_FILTER_OPERATION', {
            field: ast.left.value,
          }),
          code: 'UNACCEPTED_FILTER_OPERATION',
          details: {
            field: ast.left.value,
            operator: ast.op,
          },
        });
      }
      this.normalizeFilterAst(ast.right, stack, currentType);
      stack.pop();
      return ast;
    }
    if (ast instanceof LogicalExpression) {
      stack.push(ast);
      ast.items.forEach(item =>
        this.normalizeFilterAst(item, stack, currentType),
      );
      stack.pop();
      return ast;
    }
    if (ast instanceof ArithmeticExpression) {
      stack.push(ast);
      ast.items.forEach(item =>
        this.normalizeFilterAst(item.expression, stack, currentType),
      );
      stack.pop();
      return ast;
    }
    if (ast instanceof ArrayExpression) {
      stack.push(ast);
      ast.items.forEach(item =>
        this.normalizeFilterAst(item, stack, currentType),
      );
      stack.pop();
      return ast;
    }
    if (ast instanceof ParenthesizedExpression) {
      stack.push(ast);
      this.normalizeFilterAst(ast.expression, stack, currentType);
      stack.pop();
      return ast;
    }
    if (ast instanceof QualifiedIdentifier && currentType) {
      ast.value = currentType.normalizeFieldPath(ast.value);
      ast.field = currentType.getField(ast.value);
      ast.dataType = ast.field.type;
      return ast;
    }
    if (ast instanceof Literal) {
      /** Check if comparison expression has in stack */
      const compIdx = stack.findLastIndex(
        x => x instanceof ComparisonExpression,
      );
      if (compIdx >= 0) {
        const comp = stack[compIdx] as ComparisonExpression;
        /** If calling for right side of comparison */
        if (ast === comp.right || stack[compIdx + 1] === comp.right) {
          /** Check if comparison expression left side is a field */
          if (
            comp &&
            comp.left instanceof QualifiedIdentifier &&
            comp.left.field
          ) {
            if (ast.value == null && !comp.left.field.required)
              return ast.value;
            let decoder: Validator | undefined;
            if (
              comp.op === 'like' ||
              comp.op === '!like' ||
              comp.op === 'ilike' ||
              comp.op === '!ilike'
            ) {
              decoder = isString;
            } else decoder = this._decoderCache.get(comp.left.field);
            if (!decoder) {
              decoder = comp.left.field.type.generateCodec('decode', {
                projection: '*',
                ignoreWriteonlyFields: true,
                ignoreHiddenFields: true,
                coerce: true,
              });
              this._decoderCache.set(comp.left.field, decoder);
            }
            ast.value = decoder(ast.value);
          }
        }
      }
    }
    return ast;
  }

  toJSON(): Record<string, FilterRules.Rule> {
    return this._rules.toObject();
  }

  [Symbol.iterator](): IterableIterator<[string, FilterRules.Rule]> {
    return this._rules.entries();
  }
}
