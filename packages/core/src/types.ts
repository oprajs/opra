import type { DeepPartial, DeepPickJson, DeepPickWritable, Type } from 'ts-gems';
import type { ExecutionContext } from './interfaces/execution-context.interface';

export type Thunk<T> = T | (() => T);
export type ThunkAsync<T> = T | (() => T) | (() => Promise<T>);
export type TypeThunk<T = any> = Thunk<Type<T>>;
export type TypeThunkAsync<T = any> = ThunkAsync<Type<T>>;

export type OperationKind = 'read' | 'create' | 'update' | 'patch' | 'delete' | 'execute';
export type ResolverFunction = (context: ExecutionContext) => any | Promise<any>;

export declare type PartialInput<T> = DeepPartial<DeepPickWritable<DeepPickJson<T>>>;
export declare type PartialOutput<T> = DeepPartial<DeepPickJson<T>>;
