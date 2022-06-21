import {DeepPartial, DeepPickJson, DeepPickWritable, Type} from 'ts-gems';

export type Ctor = Type | Function;
export type TypeResolver<T = any> = (of: void) => Type<T>;
export type TypeThunk<T = any> = Type<T> | TypeResolver<T>;
export type TypeResolverAsync<T = any> = (of: void) => Type<T> | Promise<Type<T>>;
export type TypeThunkAsync<T = any> = Type<T> | TypeResolver<T>;


export declare type PartialInput<T> = DeepPartial<DeepPickWritable<DeepPickJson<T>>>;
export declare type PartialOutput<T> = DeepPartial<DeepPickJson<T>>;
