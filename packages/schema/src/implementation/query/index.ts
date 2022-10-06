import { OpraCountCollectionQuery } from './count-collection-query.js';
import { OpraCreateInstanceQuery } from './create-instance.query.js';
import { OpraDeleteCollectionQuery } from './delete-collection-query.js';
import { OpraDeleteInstanceQuery } from './delete-instance-query.js';
import { OpraGetFieldQuery } from './get-field-query.js';
import { OpraGetInstanceQuery } from './get-instance-query.js';
import { OpraGetSchemaQuery } from './get-schema-query.js';
import { OpraSearchCollectionQuery } from './search-collection-query.js';
import { OpraUpdateCollectionQuery } from './update-collection-query.js';
import { OpraUpdateInstanceQuery } from './update-instance-query.js';

export * from './create-instance.query.js';
export * from './count-collection-query.js';
export * from './delete-collection-query.js';
export * from './delete-instance-query.js';
export * from './delete-collection-query.js';
export * from './get-instance-query.js';
export * from './get-field-query.js';
export * from './get-schema-query.js';
export * from './search-collection-query.js';
export * from './update-collection-query.js';
export * from './update-instance-query.js';

export type OpraAnyEntityQuery = OpraCreateInstanceQuery | OpraCountCollectionQuery |
    OpraDeleteInstanceQuery | OpraDeleteCollectionQuery |
    OpraGetInstanceQuery | OpraGetFieldQuery |
    OpraSearchCollectionQuery | OpraUpdateCollectionQuery | OpraUpdateInstanceQuery;

export type OpraAnyQuery = OpraAnyEntityQuery | OpraGetSchemaQuery;

