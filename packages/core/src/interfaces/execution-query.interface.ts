import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/schema';
import { Expression } from '@opra/url';
import { ComplexType } from '../implementation/data-type/complex-type.js';
import { OpraService } from '../implementation/opra-service.js';
import { EntityResourceHandler } from '../implementation/resource/entity-resource-handler.js';
import { KeyValue, OperationType, QueryScope, QueryType } from '../types.js';
import { ObjectTree, stringPathToObjectTree } from '../utils/string-path-to-object-tree.js';

export type ExecutionQuery = CreateQuery | GetQuery | SearchQuery |
    UpdateQuery | UpdateManyQuery | DeleteQuery | DeleteManyQuery;

interface BaseQuery {
  queryType: QueryType;
  scope: QueryScope;
  operationType: OperationType;
}

export interface CreateQuery extends BaseQuery {
  queryType: 'create';
  scope: 'collection';
  operationType: 'create';
  resource: EntityResourceHandler;
  data: {};
  pick?: string[];
  omit?: string[];
  include?: string[];
}

export interface GetQuery extends BaseQuery {
  queryType: 'get';
  scope: 'instance';
  operationType: 'read';
  resource: EntityResourceHandler;
  keyValue: KeyValue;
  pick?: string[];
  omit?: string[];
  include?: string[];
  nested?: PropertyQuery;
}

export interface PropertyQuery extends BaseQuery {
  queryType: 'get';
  scope: 'property';
  operationType: 'read';
  property: OpraSchema.Property;
  nested?: PropertyQuery;
}

export interface UpdateQuery extends BaseQuery {
  queryType: 'update';
  scope: 'instance';
  operationType: 'update';
  resource: EntityResourceHandler;
  keyValue: KeyValue;
  data: {};
  pick?: string[];
  omit?: string[];
  include?: string[];
}

export interface UpdateManyQuery extends BaseQuery {
  queryType: 'updateMany';
  scope: 'collection';
  operationType: 'update';
  resource: EntityResourceHandler;
  filter?: string | Expression;
  data: {};
}

export interface DeleteQuery extends BaseQuery {
  queryType: 'delete';
  scope: 'instance';
  operationType: 'delete';
  resource: EntityResourceHandler;
  keyValue: KeyValue;
}

export interface DeleteManyQuery extends BaseQuery {
  queryType: 'deleteMany';
  scope: 'collection';
  operationType: 'delete';
  resource: EntityResourceHandler;
  filter?: string | Expression;
}

export interface SearchQuery extends BaseQuery {
  queryType: 'search';
  scope: 'collection';
  operationType: 'read';
  resource: EntityResourceHandler;
  pick?: string[];
  omit?: string[];
  include?: string[];
  filter?: string | Expression;
  limit?: number;
  skip?: number;
  distinct?: boolean;
  count?: boolean;
  sort?: string[];
}

export type CreateQueryOptions = StrictOmit<CreateQuery, 'queryType' | 'scope' | 'operationType' | 'resource' | 'data'>;
export type GetQueryOptions = StrictOmit<GetQuery, 'queryType' | 'scope' | 'operationType' | 'resource' | 'keyValue'>;
export type SearchQueryOptions = StrictOmit<SearchQuery, 'queryType' | 'scope' | 'operationType' | 'resource'>;
export type UpdateQueryOptions = StrictOmit<UpdateQuery, 'queryType' | 'scope' | 'operationType' | 'resource' | 'keyValue' | 'data'>;
export type UpdateManyQueryOptions = StrictOmit<UpdateManyQuery, 'queryType' | 'scope' | 'operationType' | 'resource' | 'data'>;
export type DeleteManyQueryOption = StrictOmit<DeleteManyQuery, 'queryType' | 'scope' | 'operationType' | 'resource'>;

export namespace ExecutionQuery {

  export function forCreate(
      resource: EntityResourceHandler,
      values: {},
      options?: CreateQueryOptions
  ): CreateQuery {
    if (options?.pick)
      options.pick = normalizePick(resource, options.pick);
    if (options?.omit)
      options.omit = normalizePick(resource, options.omit);
    if (options?.include)
      options.include = normalizePick(resource, options.include);

    const out: CreateQuery = {
      queryType: 'create',
      scope: 'collection',
      operationType: 'create',
      resource,
      data: values
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forGet(
      resource: EntityResourceHandler,
      key: KeyValue,
      options?: GetQueryOptions
  ): GetQuery {
    if (options?.pick)
      options.pick = normalizePick(resource, options.pick);
    if (options?.omit)
      options.omit = normalizePick(resource, options.omit);
    if (options?.include)
      options.include = normalizePick(resource, options.include);

    checkKeyFields(resource, key);
    const out: GetQuery = {
      queryType: 'get',
      scope: 'instance',
      operationType: 'read',
      resource,
      keyValue: key
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forSearch(
      resource: EntityResourceHandler,
      options?: SearchQueryOptions
  ): SearchQuery {
    if (options?.pick)
      options.pick = normalizePick(resource, options.pick);
    if (options?.omit)
      options.omit = normalizePick(resource, options.omit);
    if (options?.include)
      options.include = normalizePick(resource, options.include);
    if (options?.sort)
      options.sort = normalizePick(resource, options.sort); // todo check allowed sort fields

    const out: SearchQuery = {
      queryType: 'search',
      scope: 'collection',
      operationType: 'read',
      resource
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forGetProperty(
      property: OpraSchema.Property,
      options?: StrictOmit<PropertyQuery, 'queryType' | 'scope' | 'operationType' | 'property'>
  ): PropertyQuery {
    const out: PropertyQuery = {
      queryType: 'get',
      scope: 'property',
      operationType: 'read',
      property
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forUpdate(
      resource: EntityResourceHandler,
      keyValue: KeyValue,
      values: any,
      options?: UpdateQueryOptions
  ): UpdateQuery {
    if (options?.pick)
      options.pick = normalizePick(resource, options.pick);
    if (options?.omit)
      options.omit = normalizePick(resource, options.omit);
    if (options?.include)
      options.include = normalizePick(resource, options.include);

    checkKeyFields(resource, keyValue);
    const out: UpdateQuery = {
      queryType: 'update',
      scope: 'instance',
      operationType: 'update',
      resource,
      keyValue,
      data: values
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forUpdateMany(
      resource: EntityResourceHandler,
      values: any,
      options?: UpdateManyQueryOptions
  ): UpdateManyQuery {
    const out: UpdateManyQuery = {
      queryType: 'updateMany',
      scope: 'collection',
      operationType: 'update',
      resource,
      data: values
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forDelete(resource: EntityResourceHandler, key: KeyValue): DeleteQuery {
    checkKeyFields(resource, key);
    return {
      queryType: 'delete',
      scope: 'instance',
      operationType: 'delete',
      resource,
      keyValue: key
    }
  }

  export function forDeleteMany(
      resource: EntityResourceHandler,
      options?: DeleteManyQueryOption
  ): DeleteManyQuery {
    const out: DeleteManyQuery = {
      queryType: 'deleteMany',
      scope: 'collection',
      operationType: 'delete',
      resource,
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function isCreateQuery(q: any): q is CreateQuery {
    return q && typeof q === 'object' && q.scope === 'collection' && q.queryType === 'create';
  }

  export function isSearchQuery(q: any): q is SearchQuery {
    return q && typeof q === 'object' && q.scope === 'collection' && q.queryType === 'search';
  }

  export function isReadQuery(q: any): q is GetQuery {
    return q && typeof q === 'object' && q.scope === 'instance' && q.queryType === 'read';
  }

  export function isDeleteQuery(q: any): q is DeleteQuery {
    return q && typeof q === 'object' && q.scope === 'instance' && q.queryType === 'delete';
  }

}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function checkKeyFields(resource: EntityResourceHandler, key: KeyValue) {
  if (!resource.dataType.primaryKey)
    throw new Error(`"${resource.name}" has no primary key`);
}

function normalizePick(
    resource: EntityResourceHandler,
    fields: string[]
) {
  const fieldsTree = stringPathToObjectTree(fields) || {};
  return _normalizeFieldsList([], resource.service, resource, resource.dataType, fieldsTree, '',
      {
        additionalProperties: true
      });
}

function _normalizeFieldsList(
    target: string[],
    service: OpraService,
    resource: EntityResourceHandler,
    dataType: ComplexType | undefined,
    node: ObjectTree,
    parentPath: string = '',
    options?: {
      additionalProperties?: boolean;
    }
): string[] {
  let curPath = '';
  for (const k of Object.keys(node)) {
    const nodeVal = node[k];

    const prop = dataType?.properties?.[k];
    if (!prop) {
      curPath = parentPath ? parentPath + '.' + k : k;
      if (!options?.additionalProperties || (dataType && !dataType.additionalProperties))
        throw new TypeError(`Unknown field path "${resource.name + '.' + curPath}"`);
      if (typeof nodeVal === 'object')
        _normalizeFieldsList(target, service, resource, undefined, nodeVal, curPath, options);
      else target.push(curPath);
      continue;
    }
    curPath = parentPath ? parentPath + '.' + prop.name : prop.name;

    const propType = service.getDataType(prop.type || 'string');

    if (typeof nodeVal === 'object') {
      if (!(propType instanceof ComplexType))
        throw new TypeError(`"${curPath}" is not a complex type and has no sub fields`);
      if (target.findIndex(x => x === parentPath) >= 0)
        continue;

      target = _normalizeFieldsList(target, service, resource, propType, nodeVal, curPath, options);
      continue;
    }

    if (target.findIndex(x => x.startsWith(curPath + '.')) >= 0) {
      target = target.filter(x => !x.startsWith(curPath + '.'));
    }

    target.push(curPath);
  }
  return target;
}
