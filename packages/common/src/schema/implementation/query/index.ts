import { IChildFieldQuery } from '../../interfaces/child-field-query.interface.js';
import { CollectionCountQuery } from './collection-count-query.js';
import { CollectionCreateQuery } from './collection-create-query.js';
import { CollectionDeleteManyQuery } from './collection-delete-many-query.js';
import { CollectionDeleteQuery } from './collection-delete-query.js';
import { CollectionGetQuery } from './collection-get-query.js';
import { CollectionSearchQuery } from './collection-search-query.js';
import { CollectionUpdateManyQuery } from './collection-update-many-query.js';
import { CollectionUpdateQuery } from './collection-update-query.js';
import { FieldGetQuery } from './field-get-query.js';
import { SingletonGetQuery } from './singleton-get-query.js';

export * from './collection-create-query.js';
export * from './collection-count-query.js';
export * from './collection-delete-many-query.js';
export * from './collection-delete-query.js';
export * from './collection-delete-many-query.js';
export * from './collection-get-query.js';
export * from './field-get-query.js';
export * from './singleton-get-query.js';
export * from './collection-search-query.js';
export * from './collection-update-many-query.js';
export * from './collection-update-query.js';

export type CollectionQuery =
    CollectionCountQuery | CollectionCreateQuery |
    CollectionDeleteManyQuery | CollectionDeleteQuery |
    CollectionGetQuery | CollectionSearchQuery |
    CollectionUpdateManyQuery | CollectionUpdateQuery;

export type FieldQuery = FieldGetQuery;

export type SingletonQuery = SingletonGetQuery;

export type OpraQuery = CollectionQuery | SingletonQuery | FieldQuery;

export function isChildFieldQuery(query: any): query is IChildFieldQuery {
  return query &&
      (query.kind === 'SingletonGetQuery' ||
          query.kind === 'CollectionGetQuery' ||
          query.kind === 'FieldGetQuery');
}
