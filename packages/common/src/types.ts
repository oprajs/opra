import { Type } from 'ts-gems';

export type TypeResolver<T = any> = () => Type<T>;
export type TypeResolverAsync<T = any> = (() => Type<T>) | (() => Promise<Type<T>>)
export type TypeThunk<T = any> = Type<T> | TypeResolver<T>;
export type TypeThunkAsync<T = any> = Type<T> | TypeResolverAsync<T>;
