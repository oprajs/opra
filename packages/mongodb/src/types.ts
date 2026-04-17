import type { DTO, IfNoDeepValue } from 'ts-gems';

/**
 * Represents a MongoDB-specific Data Transfer Object for patch operations.
 * It extends the standard patch DTO with MongoDB-specific operators like _$push and _$pull.
 */
export type MongoPatchDTO<T> = _MongoPatchDTO<DTO<T>> & PatchOperators<T>;

/**
 * Internal type for recursive MongoDB patch DTO.
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
 * Utility type to pick all array properties from T.
 */
type PickArrays<T> = {
  [K in keyof T as NonNullable<T[K]> extends any[] ? K : never]: T[K];
};

/**
 * MongoDB-specific patch operators.
 */
type PatchOperators<T> = {
  /** MongoDB $push operator. */
  _$push?: PickArrays<Partial<T>>;
  /** MongoDB $pull operator. */
  _$pull?: {
    [K in keyof PickArrays<T>]?: (string | number | boolean)[];
  };
};
