import { DeepPickWritable, HighDeepNullish, Type } from 'ts-gems';

export type PartialInput<T> = HighDeepNullish<DeepPickWritable<T>>;
export type PartialOutput<T> = HighDeepNullish<T>;

export type Thunk<T> = T | (() => T);
export type ThunkAsync<T> = Thunk<T> | Thunk<Promise<T>>;
export type TypeThunk<T = any> = Thunk<Type<T>>;
export type TypeThunkAsync<T = any> = ThunkAsync<Type<T>>;
