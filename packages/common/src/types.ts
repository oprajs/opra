import { Builtin, DeepPickWritable } from 'ts-gems';

export type PartialInput<T> = DeepNullablePartial<DeepPickWritable<T>>;
export type PartialOutput<T> = DeepNullablePartial<T>;

type DeepNullablePartial<T> =
    T extends Builtin ? T
        : T extends Promise<infer U> ? Promise<DeepNullablePartial<U>>
            : T extends (infer U)[] ? DeepNullablePartial<U>[]
                : { [P in keyof T]?: DeepNullablePartial<Exclude<T[P], undefined>> | null };
