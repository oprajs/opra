import isNil from 'lodash.isnil';
import omitBy from 'lodash.omitby';
import {
  DataType,
  OpraQuery,
  OpraSchema,
  SingletonResourceInfo
} from '@opra/common';
import { SingleRequestContext } from '../adapter/request-contexts/single-request-context.js';
import { PartialOutput } from '../types.js';

export interface JsonSingletonServiceOptions<T> {
  data: T;
  resourceName?: string;
}

export class JsonSingletonService<T, TOutput = PartialOutput<T>> {
  protected _data?: T;

  constructor(readonly dataType: DataType, options?: JsonSingletonServiceOptions<T>) {
    this._data = options?.data;
  }

  async processRequest(ctx: SingleRequestContext): Promise<any> {
    const prepared = this._prepare(ctx.query);
    const fn = this[prepared.method];
    if (!fn)
      throw new TypeError(`Unimplemented method (${prepared.method})`)
    // @ts-ignore
    return fn.apply(this, prepared.args);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get(options?: JsonSingletonService.GetOptions): TOutput | undefined {
    return this._data as TOutput;
  }

  protected _prepare(query: OpraQuery): {
    method: OpraSchema.SingletonMethod;
    options: any,
    keyValue?: any;
    values?: any;
    args: any[]
  } {
    if ((query as any).resource instanceof SingletonResourceInfo) {
      if (query.dataType !== this.dataType)
        throw new TypeError(`Query data type (${query.dataType.name}) ` +
            `differs from JsonCollectionService data type (${this.dataType.name})`);
    }
    switch (query.method) {
      case 'create': {
        const options: JsonSingletonService.CreateOptions = omitBy({
          pick: query.pick,
          omit: query.omit,
          include: query.include
        }, isNil);
        const {data} = query;
        return {
          method: query.method,
          values: data,
          options,
          args: [data, options]
        };
      }
      case 'get': {
        if (query.kind === 'CollectionGetQuery') {
          const options: JsonSingletonService.GetOptions = omitBy({
            pick: query.pick,
            omit: query.omit,
            include: query.include
          }, isNil);
          const keyValue = query.keyValue;
          return {
            method: query.method,
            keyValue,
            options,
            args: [keyValue, options]
          };
        }
        if (query.kind === 'FieldGetQuery') {
          // todo
        }
        break;
      }
      case 'update': {
        const options: JsonSingletonService.UpdateOptions = omitBy({
          pick: query.pick,
          omit: query.omit,
          include: query.include
        }, isNil);
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
    }
    throw new Error(`Unimplemented query type "${(query as any).method}"`);
  }

}

export namespace JsonSingletonService {
  export type CreateOptions = {
    query?: string;
    pick?: string[];
    omit?: string[];
    include?: string[];
  }
  export type GetOptions = {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }
  export type UpdateOptions = {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }
}
