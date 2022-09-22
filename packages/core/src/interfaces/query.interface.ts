import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/schema';
import { Expression } from '@opra/url';
import { ComplexType } from '../implementation/data-type/complex-type.js';
import { OpraService } from '../implementation/opra-service.js';
import { EntityResourceHandler } from '../implementation/resource/entity-resource-handler.js';
import { KeyValue, OperationType, QueryScope, QueryType } from '../types.js';
import { ObjectTree, stringPathToObjectTree } from '../utils/string-path-to-object-tree.js';

export type OpraQuery = OpraMetadataQuery |
    OpraCreateQuery | OpraGetEntityQuery | OpraSearchQuery |
    OpraUpdateQuery | OpraUpdateManyQuery | OpraDeleteQuery | OpraDeleteManyQuery;

interface BaseOpraQuery {
  queryType: QueryType;
  scope: QueryScope;
  operation: OperationType;
}

export interface OpraMetadataQuery extends BaseOpraQuery {
  queryType: 'metadata';
  scope: QueryScope;
  operation: 'read';
  resourcePath: string[];
}

export interface OpraCreateQuery extends BaseOpraQuery {
  queryType: 'create';
  scope: 'collection';
  operation: 'create';
  resource: EntityResourceHandler;
  data: {};
  pick?: string[];
  omit?: string[];
  include?: string[];
}

export interface OpraGetEntityQuery extends BaseOpraQuery {
  queryType: 'get';
  scope: 'instance';
  operation: 'read';
  resource: EntityResourceHandler;
  keyValue: KeyValue;
  pick?: string[];
  omit?: string[];
  include?: string[];
  nested?: OpraPropertyQuery;
}

export interface OpraPropertyQuery extends BaseOpraQuery {
  queryType: 'get';
  scope: 'property';
  operation: 'read';
  property: OpraSchema.Property;
  nested?: OpraPropertyQuery;
}

export interface OpraUpdateQuery extends BaseOpraQuery {
  queryType: 'update';
  scope: 'instance';
  operation: 'update';
  resource: EntityResourceHandler;
  keyValue: KeyValue;
  data: {};
  pick?: string[];
  omit?: string[];
  include?: string[];
}

export interface OpraUpdateManyQuery extends BaseOpraQuery {
  queryType: 'updateMany';
  scope: 'collection';
  operation: 'update';
  resource: EntityResourceHandler;
  filter?: string | Expression;
  data: {};
}

export interface OpraDeleteQuery extends BaseOpraQuery {
  queryType: 'delete';
  scope: 'instance';
  operation: 'delete';
  resource: EntityResourceHandler;
  keyValue: KeyValue;
}

export interface OpraDeleteManyQuery extends BaseOpraQuery {
  queryType: 'deleteMany';
  scope: 'collection';
  operation: 'delete';
  resource: EntityResourceHandler;
  filter?: string | Expression;
}

export interface OpraSearchQuery extends BaseOpraQuery {
  queryType: 'search';
  scope: 'collection';
  operation: 'read';
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

export type CreateQueryOptions = StrictOmit<OpraCreateQuery, 'queryType' | 'scope' | 'operation' | 'resource' | 'data'>;
export type GetEntityQueryOptions = StrictOmit<OpraGetEntityQuery, 'queryType' | 'scope' | 'operation' | 'resource' | 'keyValue'>;
export type SearchQueryOptions = StrictOmit<OpraSearchQuery, 'queryType' | 'scope' | 'operation' | 'resource'>;
export type UpdateQueryOptions = StrictOmit<OpraUpdateQuery, 'queryType' | 'scope' | 'operation' | 'resource' | 'keyValue' | 'data'>;
export type UpdateManyQueryOptions = StrictOmit<OpraUpdateManyQuery, 'queryType' | 'scope' | 'operation' | 'resource' | 'data'>;
export type DeleteQueryOptions = StrictOmit<OpraDeleteQuery, 'queryType' | 'scope' | 'operation' | 'resource' | 'keyValue'>;
export type DeleteManyQueryOption = StrictOmit<OpraDeleteManyQuery, 'queryType' | 'scope' | 'operation' | 'resource'>;

export namespace OpraQuery {

  export function forCreate(
      resource: EntityResourceHandler,
      values: {},
      options?: CreateQueryOptions
  ): OpraCreateQuery {
    if (options?.pick)
      options.pick = normalizePick(resource, options.pick);
    if (options?.omit)
      options.omit = normalizePick(resource, options.omit);
    if (options?.include)
      options.include = normalizePick(resource, options.include);

    const out: OpraCreateQuery = {
      queryType: 'create',
      scope: 'collection',
      operation: 'create',
      resource,
      data: values
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forGetMetadata(
      resourcePath: string[],
      options?: GetEntityQueryOptions
  ): OpraMetadataQuery {
    // if (options?.pick)
    //   options.pick = normalizePick(resource, options.pick);
    // if (options?.omit)
    //   options.omit = normalizePick(resource, options.omit);
    // if (options?.include)
    //   options.include = normalizePick(resource, options.include);

    const out: OpraMetadataQuery = {
      queryType: 'metadata',
      scope: 'instance',
      resourcePath,
      operation: 'read',
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forGetEntity(
      resource: EntityResourceHandler,
      key: KeyValue,
      options?: GetEntityQueryOptions
  ): OpraGetEntityQuery {
    if (options?.pick)
      options.pick = normalizePick(resource, options.pick);
    if (options?.omit)
      options.omit = normalizePick(resource, options.omit);
    if (options?.include)
      options.include = normalizePick(resource, options.include);

    checkKeyFields(resource, key);
    const out: OpraGetEntityQuery = {
      queryType: 'get',
      scope: 'instance',
      operation: 'read',
      resource,
      keyValue: key
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forSearch(
      resource: EntityResourceHandler,
      options?: SearchQueryOptions
  ): OpraSearchQuery {
    if (options?.pick)
      options.pick = normalizePick(resource, options.pick);
    if (options?.omit)
      options.omit = normalizePick(resource, options.omit);
    if (options?.include)
      options.include = normalizePick(resource, options.include);
    if (options?.sort)
      options.sort = normalizePick(resource, options.sort); // todo check allowed sort fields

    const out: OpraSearchQuery = {
      queryType: 'search',
      scope: 'collection',
      operation: 'read',
      resource
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forGetProperty(
      property: OpraSchema.Property,
      options?: StrictOmit<OpraPropertyQuery, 'queryType' | 'scope' | 'operation' | 'property'>
  ): OpraPropertyQuery {
    const out: OpraPropertyQuery = {
      queryType: 'get',
      scope: 'property',
      operation: 'read',
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
  ): OpraUpdateQuery {
    if (options?.pick)
      options.pick = normalizePick(resource, options.pick);
    if (options?.omit)
      options.omit = normalizePick(resource, options.omit);
    if (options?.include)
      options.include = normalizePick(resource, options.include);

    checkKeyFields(resource, keyValue);
    const out: OpraUpdateQuery = {
      queryType: 'update',
      scope: 'instance',
      operation: 'update',
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
  ): OpraUpdateManyQuery {
    const out: OpraUpdateManyQuery = {
      queryType: 'updateMany',
      scope: 'collection',
      operation: 'update',
      resource,
      data: values
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forDelete(resource: EntityResourceHandler, key: KeyValue): OpraDeleteQuery {
    checkKeyFields(resource, key);
    return {
      queryType: 'delete',
      scope: 'instance',
      operation: 'delete',
      resource,
      keyValue: key
    }
  }

  export function forDeleteMany(
      resource: EntityResourceHandler,
      options?: DeleteManyQueryOption
  ): OpraDeleteManyQuery {
    const out: OpraDeleteManyQuery = {
      queryType: 'deleteMany',
      scope: 'collection',
      operation: 'delete',
      resource,
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function isCreateQuery(q: any): q is OpraCreateQuery {
    return q && typeof q === 'object' && q.scope === 'collection' && q.queryType === 'create';
  }

  export function isSearchQuery(q: any): q is OpraSearchQuery {
    return q && typeof q === 'object' && q.scope === 'collection' && q.queryType === 'search';
  }

  export function isReadQuery(q: any): q is OpraGetEntityQuery {
    return q && typeof q === 'object' && q.scope === 'instance' && q.queryType === 'read';
  }

  export function isDeleteQuery(q: any): q is OpraDeleteQuery {
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
