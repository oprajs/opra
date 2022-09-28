import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { ComplexType, EntityResource, EntityType, OpraSchema, OpraService } from '@opra/schema';
import { Expression } from '@opra/url';
import { KeyValue, QueryType } from '../types.js';
import { ObjectTree, pathToTree } from '../utils/path-to-tree.js';

export type OpraQuery = OpraGetSchemaQuery |
    OpraCreateQuery | OpraGetEntityQuery | OpraSearchQuery |
    OpraUpdateQuery | OpraUpdateManyQuery | OpraDeleteQuery | OpraDeleteManyQuery;

interface BaseOpraQuery {
  queryType: QueryType;
  scope: OpraSchema.QueryScope;
  operation: OpraSchema.OperationType;
}

export interface OpraGetSchemaQuery extends BaseOpraQuery {
  queryType: 'schema';
  scope: OpraSchema.QueryScope;
  operation: 'read';
  resourcePath: string[];
}

export interface OpraCreateQuery extends BaseOpraQuery {
  queryType: 'create';
  scope: 'collection';
  operation: 'create';
  resource: EntityResource;
  data: {};
  pick?: string[];
  omit?: string[];
  include?: string[];
}

export interface OpraGetEntityQuery extends BaseOpraQuery {
  queryType: 'get';
  scope: 'instance';
  operation: 'read';
  resource: EntityResource;
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
  property: OpraSchema.Field;
  nested?: OpraPropertyQuery;
}

export interface OpraUpdateQuery extends BaseOpraQuery {
  queryType: 'update';
  scope: 'instance';
  operation: 'update';
  resource: EntityResource;
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
  resource: EntityResource;
  filter?: string | Expression;
  data: {};
}

export interface OpraDeleteQuery extends BaseOpraQuery {
  queryType: 'delete';
  scope: 'instance';
  operation: 'delete';
  resource: EntityResource;
  keyValue: KeyValue;
}

export interface OpraDeleteManyQuery extends BaseOpraQuery {
  queryType: 'deleteMany';
  scope: 'collection';
  operation: 'delete';
  resource: EntityResource;
  filter?: string | Expression;
}

export interface OpraSearchQuery extends BaseOpraQuery {
  queryType: 'search';
  scope: 'collection';
  operation: 'read';
  resource: EntityResource;
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
      resource: EntityResource,
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

  export function forGetSchema(
      resourcePath: string[],
      options?: GetEntityQueryOptions
  ): OpraGetSchemaQuery {
    // if (options?.pick)
    //   options.pick = normalizePick(resource, options.pick);
    // if (options?.omit)
    //   options.omit = normalizePick(resource, options.omit);
    // if (options?.include)
    //   options.include = normalizePick(resource, options.include);

    const out: OpraGetSchemaQuery = {
      queryType: 'schema',
      scope: 'instance',
      resourcePath,
      operation: 'read',
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forGetEntity(
      resource: EntityResource,
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
      resource: EntityResource,
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
      property: OpraSchema.Field,
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
      resource: EntityResource,
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
      resource: EntityResource,
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

  export function forDelete(resource: EntityResource, key: KeyValue): OpraDeleteQuery {
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
      resource: EntityResource,
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
function checkKeyFields(resource: EntityResource, key: KeyValue) {
  if (!resource.dataType.primaryKey)
    throw new Error(`"${resource.name}" has no primary key`);
}

function normalizePick(
    resource: EntityResource,
    fields: string[]
) {
  const fieldsTree = pathToTree(fields) || {};
  return _normalizeFieldsList([], resource.service, resource, resource.dataType, fieldsTree, '',
      {
        additionalFields: true
      });
}

function _normalizeFieldsList(
    target: string[],
    service: OpraService,
    resource: EntityResource,
    dataType: ComplexType | EntityType | undefined,
    node: ObjectTree,
    parentPath: string = '',
    options?: {
      additionalFields?: boolean;
    }
): string[] {
  let curPath = '';
  for (const k of Object.keys(node)) {
    const nodeVal = node[k];

    const prop = dataType?.fields.get(k);
    if (!prop) {
      curPath = parentPath ? parentPath + '.' + k : k;
      if (!options?.additionalFields || (dataType && !dataType.additionalFields))
        throw new TypeError(`Unknown field path "${resource.name + '.' + curPath}"`);
      if (typeof nodeVal === 'object')
        _normalizeFieldsList(target, service, resource, undefined, nodeVal, curPath, options);
      else target.push(curPath);
      continue;
    }
    curPath = parentPath ? parentPath + '.' + prop.name : prop.name;

    const propType = service.getDataType(prop.type || 'string');

    if (typeof nodeVal === 'object') {
      if (!(propType && propType instanceof ComplexType))
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
