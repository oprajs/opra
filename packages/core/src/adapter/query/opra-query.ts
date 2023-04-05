import type { QueryRequestContext } from '../request-context/index.js';
import type { ElementGetQuery } from './element-get-query';
import type { CollectionCreateQuery, SingletonCreateQuery } from './entity-create-query.js';
import type { CollectionDeleteManyQuery } from './entity-delete-many-query.js';
import type { CollectionDeleteQuery, SingletonDeleteQuery } from './entity-delete-query.js';
import type { CollectionGetQuery, SingletonGetQuery } from './entity-get-query';
import type { CollectionSearchQuery } from './entity-search-query';
import type { CollectionUpdateManyQuery } from './entity-update-many-query.js';
import type { CollectionUpdateQuery, SingletonUpdateQuery } from './entity-update-query.js';

export type OpraQuery =
    CollectionCreateQuery | CollectionDeleteQuery | CollectionDeleteManyQuery |
    CollectionGetQuery | CollectionSearchQuery |
    CollectionUpdateManyQuery | CollectionUpdateQuery |
    SingletonCreateQuery | SingletonDeleteQuery | SingletonGetQuery | SingletonUpdateQuery |
    ElementGetQuery;

export namespace OpraQuery {
  export async function execute(query: OpraQuery, context: QueryRequestContext): Promise<any> {
    // @ts-ignore
    return query._execute(context);
  }

}
