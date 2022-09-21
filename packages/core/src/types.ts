import type { Type } from 'ts-gems';

export type Thunk<T> = T | (() => T);
export type ThunkAsync<T> = T | Promise<T> | (() => T) | (() => Promise<T>);
export type TypeThunk<T = any> = Thunk<Type<T>>;
export type TypeThunkAsync<T = any> = ThunkAsync<Type<T>>;

export type QueryScope = 'collection' | 'instance' | 'property';
export type QueryType = 'create' | 'get' | 'update' | 'patch' | 'delete' | 'execute' |
    'search' | 'updateMany' | 'patchMany' | 'deleteMany';
export type OperationType = 'create' | 'read' | 'update' | 'patch' | 'delete' | 'execute';

export type KeyValue = string | number | boolean | object;
