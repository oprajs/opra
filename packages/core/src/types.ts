import type { DeepPartial, DeepPickJson, DeepPickWritable, Type } from 'ts-gems';

export type Thunk<T> = T | (() => T);
export type ThunkAsync<T> = T | (() => T) | (() => Promise<T>);
export type TypeThunk<T = any> = Thunk<Type<T>>;
export type TypeThunkAsync<T = any> = ThunkAsync<Type<T>>;

export type OperationType = 'search' | 'get' | 'create' | 'update' | 'update-many' |
    'patch' | 'patch-many' | 'delete' | 'delete-many' | 'execute';
export type OperationMethod = 'create' | 'read' | 'update' | 'patch' | 'delete' | 'execute';
export type OperationLevel = 'collection' | 'instance' | 'property';


export declare type PartialInput<T> = DeepPartial<DeepPickWritable<DeepPickJson<T>>>;
export declare type PartialOutput<T> = DeepPartial<DeepPickJson<T>>;
