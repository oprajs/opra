import _ from 'lodash';
import merge from 'putil-merge';
import { Maybe } from 'ts-gems';
import { nSQL } from "@nano-sql/core";
import { InanoSQLTableConfig } from '@nano-sql/core/lib/interfaces';
import { BadRequestError, MethodNotAllowedError, ResourceConflictError } from '@opra/exception';
import {
  ComplexType, DataType,
  EntityResource,
  OpraAnyEntityQuery,
  OpraAnyQuery,
  OpraSchema
} from '@opra/schema';
import {
  $parse, ArrayExpression,
  BooleanLiteral,
  ComparisonExpression, DateLiteral,
  Expression, LogicalExpression, NullLiteral,
  NumberLiteral, ParenthesesExpression,
  QualifiedIdentifier,
  StringLiteral, TimeLiteral
} from '@opra/url';
import { QueryContext } from '../implementation/query-context.js';
import { IEntityService } from '../interfaces/entity-service.interface.js';
import { EntityInput, EntityOutput } from '../types.js';
import { pathToTree } from '../utils/path-to-tree.js';

export interface JsonCollectionServiceOptions {
  resourceName?: string;
  defaultLimit?: number;
  data?: any[];
}

let dbId = 1;
const indexingTypes = ['int', 'float', 'number', 'date', 'string'];

export class JsonCollectionService<T, TOutput = EntityOutput<T>> implements IEntityService {
  private _status: '' | 'initializing' | 'initialized' | 'error' = '';
  private _initError: any;
  private _dbName: string;
  private _initData?: any[];
  defaultLimit: number;

  constructor(readonly resource: EntityResource, options?: JsonCollectionServiceOptions) {
    if (this.resource.keyFields.length > 1)
      throw new TypeError('JsonDataService currently doesn\'t support multiple primary keys');
    this.defaultLimit = options?.defaultLimit ?? 10;
    this._initData = options?.data;
  }

  get dataType(): ComplexType {
    return this.resource.dataType;
  }

  get primaryKey(): string {
    return this.resource.keyFields[0];
  }

  get resourceName(): string {
    return this.resource.name;
  }

  async close() {
    await this._waitInitializing();
    if (this._status === 'initialized') {
      this._status = 'initializing';
      try {
        await nSQL().disconnect(this._dbName);
      } finally {
        this._status = '';
      }
    }
  }

  async processRequest(ctx: QueryContext): Promise<any> {
    const prepared = this._prepare(ctx.query);
    const fn = this[prepared.method];
    if (!fn)
      throw new TypeError(`Unimplemented method (${prepared.method})`)
    // @ts-ignore
    return fn.apply(this, prepared.args);
  }

  async get(keyValue: any, options?: JsonCollectionService.GetOptions): Promise<Maybe<TOutput>> {
    await this._init();
    const select = this._convertSelect({
      pick: options?.pick,
      omit: options?.omit,
      include: options?.include,
    })
    nSQL().useDatabase(this._dbName);
    try {
      const rows = await nSQL(this.resourceName)
          .query('select', select)
          .where([this.primaryKey, '=', keyValue])
          .exec();
      return unFlatten(rows[0]) as TOutput;
    } catch (e) {
      throw e;
    }
  }

  async count(options?: JsonCollectionService.SearchOptions): Promise<number> {
    await this._init();
    nSQL().useDatabase(this._dbName);
    const rows = await nSQL(this.resourceName)
        .query('select', ['COUNT(*) as count'])
        .where(options?.filter || [])
        .exec();
    return (rows[0]?.count) || 0;
  }

  async search(options?: JsonCollectionService.SearchOptions): Promise<TOutput[]> {
    await this._init();
    const select = this._convertSelect({
      pick: options?.pick,
      omit: options?.omit,
      include: options?.include,
    })
    const filter = this._convertFilter(options?.filter);
    nSQL().useDatabase(this._dbName);
    const query = nSQL(this.resourceName)
        .query('select', select)
        .limit(options?.limit || 10)
        .offset(options?.skip || 0)
        .orderBy(options?.sort || [])
        .where(filter || []);
    return (await query.exec()).map(x => unFlatten(x)) as TOutput[];
  }

  async create(data: EntityInput<T>, options?: JsonCollectionService.CreateOptions): Promise<TOutput> {
    if (!data[this.primaryKey])
      throw new BadRequestError({
        message: 'You must provide primary key value'
      });
    await this._init();
    const keyValue = data[this.primaryKey];
    nSQL().useDatabase(this._dbName);
    const rows = await nSQL(this.resourceName).query('select', [this.primaryKey])
        .where([this.primaryKey, '=', keyValue])
        .exec();
    if (rows.length)
      throw new ResourceConflictError(this.resourceName, this.primaryKey);
    await nSQL(this.resourceName).query('upsert', data)
        .exec();
    return await this.get(keyValue, options) as TOutput;
  }

  async update(keyValue: any, data: EntityInput<T>, options?: JsonCollectionService.UpdateOptions): Promise<Maybe<TOutput>> {
    await this._init();
    nSQL().useDatabase(this._dbName);
    await nSQL(this.resourceName)
        .query('conform rows', (row) => {
          const out = merge({}, row, {deep: true, clone: true});
          merge(out, data as any, {deep: true});
          return out;
        })
        .where([this.primaryKey, '=', keyValue])
        .exec();
    // await nSQL(this.resourceName).query("rebuild indexes").exec();
    return this.get(keyValue, options);
  }

  async updateMany(data: EntityInput<T>, options?: JsonCollectionService.UpdateManyOptions): Promise<number> {
    await this._init();
    const filter = this._convertFilter(options?.filter);
    nSQL().useDatabase(this._dbName);
    let affected = 0;
    await nSQL(this.resourceName)
        .query('conform rows', (row) => {
          const out = merge({}, row, {deep: true, clone: true});
          merge(out, data as any, {deep: true});
          affected++;
          return out;
        })
        .where(filter)
        .exec();
    // await nSQL(this.resourceName).query("rebuild indexes").exec();
    return affected;
  }

  async delete(keyValue: any): Promise<boolean> {
    await this._init();
    nSQL().useDatabase(this._dbName);
    const result = await nSQL(this.resourceName)
        .query('delete')
        .where([this.primaryKey, '=', keyValue])
        .exec();
    return !!result.length;
  }

  async deleteMany(options?: JsonCollectionService.DeleteManyOptions): Promise<number> {
    await this._init();
    const filter = this._convertFilter(options?.filter);
    nSQL().useDatabase(this._dbName);
    const result = await nSQL(this.resourceName)
        .query('delete')
        .where(filter)
        .exec();
    return result.length;
  }

  private async _waitInitializing() {
    if (this._status === 'initializing') {
      return new Promise<void>((resolve, reject) => {
        const reTry = () =>
            setTimeout(() => {
              if (this._status === '')
                return resolve(this._init());
              if (this._status === 'error')
                return reject(this._initError);
              if (this._status === 'initialized')
                return resolve();
              reTry();
            }, 50).unref();
        reTry();
      })
    }
  }

  protected async _init() {
    await this._waitInitializing();
    if (this._status === 'initialized')
      return;
    this._status = 'initializing';
    this._dbName = 'JsonDataService_DB_' + (dbId++);
    try {
      const table: InanoSQLTableConfig = {
        name: this.resourceName,
        model: {},
        indexes: {}
      }
      for (const [k, f] of this.resource.dataType.fields.entries()) {
        const fieldType = this.resource.owner.getDataType(f.type || 'string');
        const o: any = table.model[k + ':' + dataTypeToSQLType(fieldType, !!f.isArray)] = {};
        if (k === this.primaryKey)
          o.pk = true;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const indexes = table.indexes!;

      // Add indexes for sort fields
      const searchMethod = this.resource.metadata.methods.search;
      if (searchMethod) {
        if (searchMethod.sortFields) {
          searchMethod.sortFields.forEach(fieldName => {
            const f = this.dataType.getField(fieldName);
            const fieldType = this.resource.owner.getDataType(f.type || 'string');
            const t = dataTypeToSQLType(fieldType, !!f.isArray);
            if (indexingTypes.includes(t))
              indexes[fieldName + ':' + t] = {};
          })
        }
        if (searchMethod.filters) {
          searchMethod.filters.forEach(filter => {
            const f = this.dataType.getField(filter.field);
            const fieldType = this.resource.owner.getDataType(f.type || 'string');
            const t = dataTypeToSQLType(fieldType, !!f.isArray);
            if (indexingTypes.includes(t))
              indexes[filter.field + ':' + t] = {};
          })
        }
      }

      await nSQL().createDatabase({
        id: this._dbName,
        version: 3,
        tables: [table]
      });
      this._status = 'initialized';
      if (this._initData) {
        nSQL().useDatabase(this._dbName);
        await nSQL(this.resourceName)
            .query('upsert', this._initData)
            .exec();
        delete this._initData;
      }
    } catch (e: any) {
      this._initError = e;
      this._status = 'error';
      throw e;
    }
  }

  protected _prepare(query: OpraAnyQuery): {
    method: OpraSchema.EntityMethod;
    options: any,
    keyValue?: any;
    values?: any;
    args: any[]
  } {
    if ((query as any).resource instanceof EntityResource) {
      if ((query as OpraAnyEntityQuery).dataType !== this.dataType)
        throw new TypeError(`Query data type (${(query as OpraAnyEntityQuery).dataType.name}) ` +
            `differs from JsonDataService data type (${this.dataType.name})`);
    }
    switch (query.method) {
      case 'count': {
        const options: JsonCollectionService.CountOptions = _.omitBy({
          filter: this._convertFilter(query.filter)
        }, _.isNil);
        return {
          method: query.method,
          options,
          args: [options]
        };
      }
      case 'create': {
        const options: JsonCollectionService.CreateOptions = _.omitBy({
          pick: query.pick,
          omit: query.omit,
          include: query.include
        }, _.isNil);
        const {data} = query;
        return {
          method: query.method,
          values: data,
          options,
          args: [data, options]
        };
      }
      case 'get': {
        if (query.kind === 'GetInstanceQuery') {
          const options: JsonCollectionService.GetOptions = _.omitBy({
            pick: query.pick,
            omit: query.omit,
            include: query.include
          }, _.isNil);
          const keyValue = query.keyValue;
          return {
            method: query.method,
            keyValue,
            options,
            args: [keyValue, options]
          };
        }
        if (query.kind === 'GetFieldQuery') {
          // todo
        }
        break;
      }
      case 'search': {
        if (query.distinct)
          throw new MethodNotAllowedError({
            message: '$distinct parameter is not supported by JsonDataService'
          })
        const options: JsonCollectionService.SearchOptions = _.omitBy({
          pick: query.pick,
          omit: query.omit,
          include: query.include,
          filter: this._convertFilter(query.filter),
          sort: query.sort?.length ? query.sort : undefined,
          skip: query.skip,
          limit: query.limit,
          offset: query.skip,
          count: query.count,
        }, _.isNil)
        return {
          method: query.method,
          options,
          args: [options]
        };
      }
      case 'update': {
        const options: JsonCollectionService.UpdateOptions = _.omitBy({
          pick: query.pick,
          omit: query.omit,
          include: query.include
        }, _.isNil);
        const {data} = query;
        const keyValue = query.keyValue;
        return {
          method: query.method,
          keyValue: query.keyValue,
          values: data,
          options,
          args: [keyValue, data, options]
        };
      }
      case 'updateMany': {
        const options: JsonCollectionService.UpdateManyOptions = _.omitBy({
          filter: this._convertFilter(query.filter)
        }, _.isNil);
        const {data} = query;
        return {
          method: query.method,
          options,
          args: [data, options]
        };
      }
      case 'delete': {
        const options = {};
        const keyValue = query.keyValue;
        return {
          method: query.method,
          keyValue,
          options,
          args: [keyValue, options]
        };
      }
      case 'deleteMany': {
        const options = _.omitBy({
          filter: this._convertFilter(query.filter)
        }, _.isNil)
        return {
          method: query.method,
          options,
          args: [options]
        };
      }
    }
    throw new Error(`Unimplemented query type "${(query as any).method}"`);
  }

  protected _convertSelect(args: {
    pick?: string[],
    omit?: string[],
    include?: string[]
  }): string[] {
    const result: string[] = [];
    const document = this.dataType.owner;
    const processDataType = (dt: ComplexType, path: string, pick?: {}, omit?: {}, include?: {}) => {
      let kl: string;
      for (const [k, f] of dt.fields) {
        kl = k.toLowerCase();
        if (omit?.[kl] === true)
          continue;
        if (
            (((!pick && !f.exclusive) || pick?.[kl])) || include?.[kl]
        ) {
          const fieldType = document.getDataType(f.type);
          const subPath = (path ? path + '.' : '') + f.name;
          if (fieldType instanceof ComplexType) {
            processDataType(fieldType, subPath,
                typeof pick?.[kl] === 'object' ? pick?.[kl] : undefined,
                typeof omit?.[kl] === 'object' ? omit?.[kl] : undefined,
                typeof include?.[kl] === 'object' ? include?.[kl] : undefined
            );
            continue;
          }
          result.push(subPath);
        }
      }
    }
    processDataType(this.dataType, '',
        (args.pick ? pathToTree(args.pick, true) : undefined),
        (args.omit ? pathToTree(args.omit, true) : undefined),
        (args.include ? pathToTree(args.include, true) : undefined)
    )
    return result;
  }

  protected _convertFilter(str: string | Expression | undefined | {}): any {
    const ast = typeof str === 'string'
        ? $parse(str)
        : str;
    if (!ast || !(ast instanceof Expression))
      return ast;

    if (ast instanceof ComparisonExpression) {
      const left = this._convertFilter(ast.left);
      const right = this._convertFilter(ast.right);

      switch (ast.op) {
        case '=':
          return [left, '=', right];
        case '!=':
          return [left, '!=', right];
        case '>':
          return [left, '>', right];
        case '>=':
          return [left, '>=', right];
        case '<':
          return [left, '<', right];
        case '<=':
          return [left, '<=', right];
        case 'like':
          return [left, 'LIKE', right];
        case '!like':
          return [left, 'NOT LIKE', right];
        case 'in':
          return [left, 'IN', Array.isArray(right) ? right : [right]];
        case '!in':
          return [left, 'NOT IN', Array.isArray(right) ? right : [right]];
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
      return ast.items.map(item => this._convertFilter(item));
    }
    if (ast instanceof LogicalExpression) {
      return ast.items.map(item => this._convertFilter(item))
          .reduce((a, v) => {
            if (a.length)
              a.push(ast.op.toUpperCase());
            a.push(v);
            return a;
          }, [] as any[]);
    }
    if (ast instanceof ArrayExpression) {
      return ast.items.map(item => this._convertFilter(item));
    }
    if (ast instanceof ParenthesesExpression) {
      return this._convertFilter(ast.expression);
    }
    throw new Error(`${ast.kind} is not implemented yet`);
  }

}

export namespace JsonCollectionService {
  export type CountOptions = {
    filter?: string | Expression | {};
  }
  export type CreateOptions = {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }
  export type GetOptions = {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }
  export type SearchOptions = {
    pick?: string[];
    omit?: string[];
    include?: string[];
    filter?: any[];
    sort?: string[];
    limit?: number;
    skip?: number;
    distinct?: boolean;
    count?: boolean;
  }
  export type UpdateOptions = {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }
  export type UpdateManyOptions = {
    filter?: any[];
  }
  export type DeleteManyOptions = {
    filter?: any[];
  }
}

function unFlatten(input: any): any {
  if (!input)
    return;
  const target = {};
  for (const k of Object.keys(input)) {
    if (k.includes('.')) {
      const keys = k.split('.');
      let o = target;
      for (let i = 0; i < keys.length - 1; i++) {
        o = o[keys[i]] = o[keys[i]] || {};
      }
      o[keys[keys.length - 1]] = input[k];
    } else target[k] = input[k];
  }
  return target;
}

function dataTypeToSQLType(dataType: DataType, isArray: boolean): string {
  let out = 'any';
  if (dataType.kind !== 'SimpleType')
    out = 'object';
  else {
    switch (dataType.name) {
      case 'boolean':
      case 'number':
      case 'string':
        out = dataType.name;
        break;
      case 'integer':
        out = 'int';
        break;
        // case 'date': //there is bug in nano-sql.
        // case 'date-time':
        //   out = 'date';
        //   break;
      case 'time':
        out = 'string';
        break;
      case 'uuid':
        out = 'uuid'
        break;
    }
  }
  return out + (isArray ? '[]' : '');
}
