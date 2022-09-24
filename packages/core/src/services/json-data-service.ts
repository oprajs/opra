import _ from 'lodash';
import ruleJudgment from 'rule-judgment'
import { Maybe } from 'ts-gems';
import {
  $parse, ArrayExpression,
  BooleanLiteral,
  ComparisonExpression, DateLiteral,
  Expression, LogicalExpression, NullLiteral,
  NumberLiteral, ParenthesesExpression,
  QualifiedIdentifier,
  StringLiteral, TimeLiteral
} from '@opra/url';
import { ResourceConflictError } from '../exception/index.js';
import { QueryContext } from '../implementation/query-context.js';
import { OpraQuery } from '../interfaces/query.interface.js';
import { EntityInput, EntityOutput, QueryType } from '../types.js';
import { IEntityService } from './entity-resource-controller.js';

// Fix invalid importing (with ESM) of rule-judgment package
const createFilterFn = typeof (ruleJudgment as any) === 'function'
    ? (ruleJudgment as any)
    : (ruleJudgment as any).default;

export interface JsonDataServiceAgs<T> {
  resourceName: string;
  data: T[];
  primaryKey: string;
}

export namespace JsonDataService {
  export type GetOptions = {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }
  export type SearchOptions = {
    pick?: string[];
    omit?: string[];
    include?: string[];
    limit?: number;
    skip?: number;
    distinct?: boolean;
    total?: boolean;
    filter?: string | Expression | {};
  }
  export type CreateOptions = {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }
  export type UpdateOptions = {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }
  export type UpdateManyOptions = {
    filter?: string | Expression | {};
  }
  export type DeleteManyOptions = {
    filter?: string | Expression | {};
  }
}

export class JsonDataService<T, TOutput = EntityOutput<T>> implements IEntityService {
  resourceName: string;
  data: T[];
  primaryKey: string;

  constructor(args: JsonDataServiceAgs<T>) {
    this.resourceName = args.resourceName;
    this.data = args.data;
    this.primaryKey = args.primaryKey;
  }

  processRequest(ctx: QueryContext): any {
    const prepared = JsonDataService.prepare(ctx.query);
    const fn = this[prepared.method];
    if (!fn)
      throw new TypeError(`Unimplemented method (${prepared.method})`)
    return fn.apply(this, prepared.args);
  }

  get(keyValue: any, options?: JsonDataService.GetOptions): Maybe<TOutput> {
    const primaryKey = this.primaryKey;
    let v = this.data.find(x => '' + x[primaryKey] === '' + keyValue) as TOutput;
    v = JsonDataService.filterProperties(v, options?.pick, options?.omit, options?.include);
    return v;
  }

  count(options?: JsonDataService.SearchOptions): Maybe<number> {
    return this.search(options).length;
  }

  search(options?: JsonDataService.SearchOptions): Maybe<TOutput>[] {
    let out: any[];
    if (options?.filter) {
      const filter = JsonDataService.convertFilter(options.filter);
      const filterFn = createFilterFn(filter);
      out = this.data.filter(filterFn);
    } else out = this.data;
    return out.map(v => JsonDataService.filterProperties(v, options?.pick, options?.omit, options?.include));
  }

  create(data: EntityInput<T>, options?: JsonDataService.CreateOptions): TOutput {
    if (this.get(data[this.primaryKey]))
      throw new ResourceConflictError(this.resourceName, this.primaryKey);
    this.data.push(data as T);
    return JsonDataService.filterProperties(data, options?.pick, options?.omit, options?.include);
  }

  update(keyValue: any, data: EntityInput<T>, options?: JsonDataService.UpdateOptions): Maybe<TOutput> {
    const primaryKey = this.primaryKey;
    const i = this.data.findIndex(x => '' + x[primaryKey] === '' + keyValue);
    if (i >= 0) {
      data = Object.assign(this.data[i] as any, data);
      return JsonDataService.filterProperties(data, options?.pick, options?.omit, options?.include);
    }
  }

  updateMany(data: EntityInput<T>, options?: JsonDataService.UpdateManyOptions): number {
    const items = this.search({filter: options?.filter});
    for (let i = 0; i < items.length; i++) {
      Object.assign(items[i] as any, data);
    }
    return items.length;
  }

  delete(keyValue: any): boolean {
    const primaryKey = this.primaryKey;
    const i = this.data.findIndex(x => '' + x[primaryKey] === '' + keyValue);
    if (i >= 0) {
      this.data = this.data.slice(i, 1);
      return true;
    }
    return false;
  }

  deleteMany(options?: JsonDataService.DeleteManyOptions): number {
    const items: any[] = this.search({filter: options?.filter});
    this.data = this.data.filter(x => !items.includes(x));
    return items.length;
  }

  static filterProperties(
      obj: any,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      pick: string[] | undefined,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      omit: string[] | undefined,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      include: string[] | undefined,
  ): any {
    if (!obj)
      return;
    return obj;
  }

  static prepare(query: OpraQuery): {
    method: QueryType;
    options: any,
    keyValue?: any;
    values?: any;
    args: any[]
  } {
    switch (query.queryType) {
      case 'create': {
        const options: JsonDataService.CreateOptions = _.omitBy({
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          include: query.include?.length ? query.include : undefined,
        }, _.isNil);
        const {data} = query;
        return {
          method: query.queryType,
          values: data,
          options,
          args: [data, options]
        };
      }
      case 'get': {
        const options: JsonDataService.GetOptions = _.omitBy({
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          include: query.include?.length ? query.include : undefined,
        }, _.isNil);
        const keyValue = query.keyValue;
        return {
          method: query.queryType,
          keyValue,
          options,
          args: [keyValue, options]
        };
      }
      case 'search': {
        const options: JsonDataService.SearchOptions = _.omitBy({
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          include: query.include?.length ? query.include : undefined,
          sort: query.sort?.length ? query.sort : undefined,
          limit: query.limit,
          offset: query.skip,
          distinct: query.distinct,
          total: query.count,
          filter: JsonDataService.convertFilter(query.filter)
        }, _.isNil)
        return {
          method: query.queryType,
          options,
          args: [options]
        };
      }
      case 'update': {
        const options: JsonDataService.UpdateOptions = _.omitBy({
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          include: query.include?.length ? query.include : undefined,
        }, _.isNil);
        const {data} = query;
        const keyValue = query.keyValue;
        return {
          method: query.queryType,
          keyValue: query.keyValue,
          values: data,
          options,
          args: [keyValue, data, options]
        };
      }
      case 'updateMany': {
        const options: JsonDataService.UpdateManyOptions = _.omitBy({
          filter: JsonDataService.convertFilter(query.filter)
        }, _.isNil);
        const {data} = query;
        return {
          method: query.queryType,
          options,
          args: [data, options]
        };
      }
      case 'delete': {
        const options = {};
        const keyValue = query.keyValue;
        return {
          method: query.queryType,
          keyValue,
          options,
          args: [keyValue, options]
        };
      }
      case 'deleteMany': {
        const options = _.omitBy({
          filter: JsonDataService.convertFilter(query.filter)
        }, _.isNil)
        return {
          method: query.queryType,
          options,
          args: [options]
        };
      }
      default:
        throw new Error(`Unimplemented query type "${(query as any).queryType}"`);
    }
  }

  static convertFilter(str: string | Expression | undefined | {}): any {
    const ast = typeof str === 'string'
        ? $parse(str)
        : str;
    if (!ast || !(ast instanceof Expression))
      return ast;

    if (ast instanceof ComparisonExpression) {
      const left = JsonDataService.convertFilter(ast.left);
      const right = JsonDataService.convertFilter(ast.right);

      switch (ast.op) {
        case '=':
          return {$eq: {[left]: right}};
        case '!=':
          return {$ne: {[left]: right}};
        case '>':
          return {$gt: {[left]: right}};
        case '>=':
          return {$gte: {[left]: right}};
        case '<':
          return {$lt: {[left]: right}};
        case '<=':
          return {$lte: {[left]: right}};
        case 'in':
          return {$in: {[left]: right}};
        case '!in':
          return {$nin: {[left]: right}};
        default:
          throw new Error(`ComparisonExpression operator (${ast.op}) not implemented yet`);
      }
    }
    if (ast instanceof QualifiedIdentifier) {
      return ast.value;
    }
    if (ast instanceof NumberLiteral ||
        ast instanceof StringLiteral ||
        ast instanceof BooleanLiteral ||
        ast instanceof NullLiteral ||
        ast instanceof DateLiteral ||
        ast instanceof TimeLiteral
    ) {
      return ast.value;
    }
    if (ast instanceof ArrayExpression) {
      return ast.items.map(JsonDataService.convertFilter);
    }
    if (ast instanceof LogicalExpression) {
      if (ast.op === 'or')
        return {$or: ast.items.map(JsonDataService.convertFilter)};
      return {$and: ast.items.map(JsonDataService.convertFilter)};
    }
    if (ast instanceof ArrayExpression) {
      return ast.items.map(JsonDataService.convertFilter);
    }
    if (ast instanceof ParenthesesExpression) {
      return JsonDataService.convertFilter(ast.expression);
    }
    throw new Error(`${ast.type} is not implemented yet`);
  }

}
