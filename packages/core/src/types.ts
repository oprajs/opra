import { Builtin, DeepPickWritable } from 'ts-gems';
import { OpraSchema } from '@opra/schema';

export type QueryType = OpraSchema.EntityMethodType | 'schema' | 'execute';

export type KeyValue = string | number | boolean | object;

export type EntityInput<T> = DeepNullableIfPartial<DeepPickWritable<T>>;
export type EntityOutput<T> = DeepNullableIfPartial<T>;

export type DeepNullableIfPartial<T> = _DeepNullableIfPartial<T>;
type _DeepNullableIfPartial<T> =
    T extends Builtin ? T
        : T extends Promise<infer U> ? Promise<DeepNullableIfPartial<U>>
            : T extends (infer U)[] ? DeepNullableIfPartial<U>[]
                : { [P in keyof T]?: DeepNullableIfPartial<Exclude<T[P], undefined>> | null };
