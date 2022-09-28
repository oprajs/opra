import { Type } from 'ts-gems';

export type Thunk<T> = T | (() => T);
export type ThunkAsync<T> = T | Promise<T> | (() => T) | (() => Promise<T>);
export type TypeThunk<T = any> = Thunk<Type<T>>;
export type TypeThunkAsync<T = any> = ThunkAsync<Type<T>>;
