import { Builtin, DeepPickWritable, Type } from 'ts-gems';

export type PartialInput<T> = DeepNullablePartial<DeepPickWritable<T>>;
export type PartialOutput<T> = DeepNullablePartial<T>;

type DeepNullablePartial<T> =
    T extends Builtin ? T
        : T extends Promise<infer U> ? Promise<DeepNullablePartial<U>>
            : T extends (infer U)[] ? DeepNullablePartial<U>[]
                : { [P in keyof T]?: DeepNullablePartial<Exclude<T[P], undefined>> | null };

export type Thunk<T> = T | (() => T);
export type ThunkAsync<T> = T | Promise<T> | (() => T) | (() => Promise<T>);
export type TypeThunk<T = any> = Thunk<Type<T>>;
export type TypeThunkAsync<T = any> = ThunkAsync<Type<T>>;

export type Named<T> = T & { name: string };
