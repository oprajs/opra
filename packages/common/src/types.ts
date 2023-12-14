import type { HighDeepOmitNever, IfNoDeepValue, Type } from 'ts-gems';
import { IfEquals } from 'ts-gems/lib/type-check';

export type Thunk<T> = T | (() => T);
export type ThunkAsync<T> = Thunk<T> | Thunk<Promise<T>>;
export type TypeThunk<T = any> = Thunk<Type<T>>;
export type TypeThunkAsync<T = any> = ThunkAsync<Type<T>>;

/**
 * Returns given type as a Data Transfer Object (DTO) interface, Removes symbol keys and function properties.
 * @template T - The type of the data being transferred.
 */
export type DTO<T> = HighDeepOmitNever<_DTO<T>>;
type _DTO<T> =
// Infer array values and deep process
    T extends (infer U)[] ? _DTO<U>[]
        : IfNoDeepValue<T> extends true ? T
            : {
              [K in keyof T]:
              // Omit symbols
              K extends symbol ? never
                  // Omit readonly keys
                  : IfEquals<{ [Q in K]: T[K] }, { readonly [Q in K]: T[K] }> extends true ? never
                      // Omit functions
                      : T[K] extends Function ? never
                          // Deep process
                          : _DTO<Exclude<T[K], undefined>>
            };

export type PartialDTO<T> = HighDeepOmitNever<_PartialDTO<T>>;
type _PartialDTO<T> =
// Infer array values and deep process
    T extends (infer U)[] ? PartialDTO<U>[]
        : IfNoDeepValue<T> extends true ? T
            : {
              [K in keyof T]?:
              // Omit symbols
              K extends symbol ? never
                  // Omit readonly keys
                  : IfEquals<{ [Q in K]: T[K] }, { readonly [Q in K]: T[K] }> extends true ? never
                      // Omit functions
                      : T[K] extends Function ? never
                          // Deep process, remove "undefined" from value
                          : _PartialDTO<Exclude<T[K], undefined>>
            };


export type PatchDTO<T> = HighDeepOmitNever<_PatchDTO<T>>;
type _PatchDTO<T> =
// Infer array values and deep process
    T extends (infer U)[] ? _PatchDTO<U>[]
        : IfNoDeepValue<T> extends true ? T
            : {
              [K in keyof T]?:
              // Omit symbols
              K extends symbol ? never
                  // Omit readonly keys
                  : IfEquals<{ [Q in K]: T[K] }, { readonly [Q in K]: T[K] }> extends true ? never
                      // Omit functions
                      : T[K] extends Function ? never
                          // Deep process, remove "undefined" from value, add null
                          : _PatchDTO<Exclude<T[K], undefined>> | null
            };
