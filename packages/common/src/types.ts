import type { IfNoDeepValue, IfUndefined, OmitNever, Type, WritableKeys } from 'ts-gems';

export type Thunk<T> = T | (() => T);
export type ThunkAsync<T> = Thunk<T> | Thunk<Promise<T>>;
export type TypeThunk<T = any> = Thunk<Type<T>>;
export type TypeThunkAsync<T = any> = ThunkAsync<Type<T>>;

/**
 * Returns given type as a Data Transfer Object (DTO) interface, Removes symbol keys and function properties.
 * @template T - The type of the data being transferred.
 */
export type DTO<T> = _DTO<Exclude<T, undefined>>;
type _DTO<T, K extends keyof T = WritableKeys<T>> =
    IfNoDeepValue<T> extends true ? T
        : OmitNever<{
          [P in K]: P extends symbol ? never
              : T[P] extends Function ? never
                  : DTO<Exclude<T[P], undefined>>
        }>;

export type PartialDTO<T> = _PartialDTO<Exclude<T, undefined>>;
type _PartialDTO<T, K extends keyof T = WritableKeys<T>> =
    IfNoDeepValue<T> extends true ? T
        : OmitNever<{
          [P in K]?: P extends symbol ? never
              : T[P] extends Function ? never
                  : PartialDTO<Exclude<T[P], undefined>>
        }>;


export type PatchDTO<T> = _PatchDTO<Exclude<T, undefined>>;
type _PatchDTO<T, K extends keyof T = WritableKeys<T>> =
    IfNoDeepValue<T> extends true ? T
        : OmitNever<{
          [P in K]?: P extends symbol ? never
              : T[P] extends Function ? never
                  : IfUndefined<T> extends true ? T[P]
                      : PatchDTO<Exclude<T[P], undefined>> | null
        }>;
