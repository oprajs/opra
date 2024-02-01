import type {
  DeeperNullish, DeeperPartial,
  IfNever, IfNoDeepValue, Type
} from 'ts-gems';

export type Thunk<T> = T | (() => T);
export type ThunkAsync<T> = Thunk<T> | (() => Promise<T>)
export type TypeThunk<T = any> = Thunk<Type<T>>;
export type TypeThunkAsync<T = any> = ThunkAsync<Type<T>>;

/**
 * Returns given type as a Data Transfer Object (DTO) interface, Removes symbol keys and function properties.
 * @template T - The type of the data being transferred.
 */
export type DTO<T> = {
  [K in keyof T as (IfNever<Exclude<T[K], undefined | Function>, never, K>)]:
  // Deep process arrays
  Exclude<T[K], undefined | null> extends (infer U)[] ? DTO<U>[]
      // Do not deep process No-Deep values
      : IfNoDeepValue<Exclude<T[K], undefined | null>> extends true ? Exclude<T[K], undefined | null>
          // Deep process objects
          : DTO<Exclude<T[K], undefined | null>>
};

export type PartialDTO<T> = DeeperPartial<DTO<T>>;
export type PatchDTO<T> = DeeperNullish<DTO<T>>;

export type URLSearchParamsInit = string[][] | Record<string, string> | string | URLSearchParams;
