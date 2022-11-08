export const DATATYPE_METADATA = 'opra:data_type.metadata';
export const COMPLEXTYPE_FIELDS = 'opra:complex_type.fields';
export const RESOURCE_METADATA = 'opra:resource.metadata';
export const RESOLVER_METADATA = 'opra:resolver.metadata';
export const IGNORE_RESOLVER_METHOD = 'opra:ignore_resolver-method';

export const MAPPED_TYPE_METADATA = 'opra:mapped_type.metadata';

export const singletonMethods = ['create', 'delete', 'get', 'update'];
export const collectionMethods = [...singletonMethods, 'count', 'deleteMany', 'updateMany', 'search'];
