import type { DTO, IfNoDeepValue } from 'ts-gems';

export type MongoPatchDTO<T> = _MongoPatchDTO<DTO<T>> & PatchOperators<T>;

/**
 * Returns given type as a Data Transfer Object (DTO) interface, Removes symbol keys and function properties.
 * @template T - The type of the data being transferred.
 */
type _MongoPatchDTO<T> = {
  [K in keyof T]?: Exclude<
    // Deep process arrays
    T[K],
    undefined
  > extends (infer U)[]
    ? _MongoPatchDTO<U>[] | null
    : // Do not deep process No-Deep values
      IfNoDeepValue<NonNullable<T[K]>> extends true
      ? T[K] | null
      : // Deep process objects
          (_MongoPatchDTO<NonNullable<T[K]>> & PatchOperators<T>) | null;
};

/**
 * Pick all array properties in T
 */
type PickArrays<T> = {
  [K in keyof T as NonNullable<T[K]> extends any[] ? K : never]: T[K];
};

type PatchOperators<T> = {
  _$push?: PickArrays<Partial<T>>;
  _$pull?: {
    [K in keyof PickArrays<T>]?: (string | number | boolean)[];
  };
};
