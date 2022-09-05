import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { Expression } from '@opra/url';
import { EntityResourceController } from '../implementation/resource/entity-resource-controller.js';
import { KeyValue, OperationType, QueryScope, QueryType } from '../types.js';

export type ExecutionQuery = CreateQuery | SearchQuery | ReadQuery | DeleteQuery | DeleteManyQuery;

interface BaseQuery {
  queryType: QueryType;
  scope: QueryScope;
  operationType: OperationType;
}

export interface CreateQuery extends BaseQuery {
  queryType: 'create';
  scope: 'collection';
  operationType: 'create';
  resource: EntityResourceController;
  values: {};
}

export interface ReadQuery extends BaseQuery {
  queryType: 'read';
  scope: 'instance';
  operationType: 'read';
  resource: EntityResourceController;
  key: KeyValue;
  pick?: string[];
  omit?: string[];
  nested?: PropertyQuery;
}

export interface PropertyQuery extends BaseQuery {
  queryType: 'read';
  scope: 'property';
  operationType: 'read';
  property: OpraSchema.Property;
  nested?: PropertyQuery;
}

export interface DeleteQuery extends BaseQuery {
  queryType: 'delete';
  scope: 'instance';
  operationType: 'delete';
  resource: EntityResourceController;
  key: KeyValue;
}

export interface DeleteManyQuery extends BaseQuery {
  queryType: 'deleteMany';
  scope: 'collection';
  operationType: 'delete';
  resource: EntityResourceController;
  filter?: string | Expression;
}

export interface SearchQuery extends BaseQuery {
  queryType: 'search';
  scope: 'collection';
  operationType: 'read';
  resource: EntityResourceController;
  pick?: string[];
  omit?: string[];
  include?: string[];
  filter?: string | Expression;
  limit?: number;
  skip?: number;
  distinct?: boolean;
  total?: boolean;
  sort?: string[];
}

export namespace ExecutionQuery {

  export function forSearch(
      resource: EntityResourceController,
      options?: StrictOmit<SearchQuery, 'queryType' | 'scope' | 'operationType' | 'resource'>
  ): SearchQuery {
    const out: SearchQuery = {
      queryType: 'search',
      scope: 'collection',
      operationType: 'read',
      resource
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forRead(
      resource: EntityResourceController,
      key: KeyValue,
      options?: StrictOmit<ReadQuery, 'queryType' | 'scope' | 'operationType' | 'resource' | 'key'>
  ): ReadQuery {
    checkKeyFields(resource, key);
    const out: ReadQuery = {
      queryType: 'read',
      scope: 'instance',
      operationType: 'read',
      resource,
      key
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forProperty(
      property: OpraSchema.Property,
      options?: StrictOmit<PropertyQuery, 'queryType' | 'scope' | 'operationType' | 'property'>
  ): PropertyQuery {
    const out: PropertyQuery = {
      queryType: 'read',
      scope: 'property',
      operationType: 'read',
      property
    }
    Object.assign(out, _.omit(options, Object.keys(out)));
    return out;
  }

  export function forDelete(resource: EntityResourceController, key: KeyValue): DeleteQuery {
    checkKeyFields(resource, key);
    return {
      queryType: 'delete',
      scope: 'instance',
      operationType: 'delete',
      resource,
      key
    }
  }

  export function forDeleteMany(
      resource: EntityResourceController,
      options?: StrictOmit<DeleteManyQuery, 'queryType' | 'scope' | 'operationType' | 'resource'>
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

  export function isReadQuery(q: any): q is ReadQuery {
    return q && typeof q === 'object' && q.scope === 'instance' && q.queryType === 'read';
  }

  export function isDeleteQuery(q: any): q is ReadQuery {
    return q && typeof q === 'object' && q.scope === 'instance' && q.queryType === 'delete';
  }

}

function checkKeyFields(resource: EntityResourceController, key: KeyValue) {
  if (!resource.primaryKey)
    throw new Error(`"${resource.name}" resource doesn't support instance level queries`);
}
