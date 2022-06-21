import {Type} from 'ts-gems';
import {Expression} from '@opra/url';

export interface OpraContext {

  getSchemaType<T = any>(): Type<T>;

  getCurrentPath(): string[] | undefined;

  getQuery(): QueryNode;

  getThisValue(): object | undefined;

  setThisValue(v: object);

  getUserContext<T = any>(): T;

}

export interface QueryNode {

  parent?: QueryNode;

  type: Type;

  name: string;

  keyValue: string | Record<string, any> | undefined;

  properties?: Record<string, boolean | QueryNode>;

  filter?: Expression;

  limit?: number;

  skip?: number;

  distinct?: boolean;

  total?: boolean;

}

