import type { Type } from 'ts-gems';
import { Builtin, DeepPickWritable } from 'ts-gems';
import { OpraSchema } from '@opra/schema';

export type Thunk<T> = T | (() => T);
export type ThunkAsync<T> = T | Promise<T> | (() => T) | (() => Promise<T>);
export type TypeThunk<T = any> = Thunk<Type<T>>;
export type TypeThunkAsync<T = any> = ThunkAsync<Type<T>>;

export type QueryScope = 'collection' | 'instance' | 'property';
export type QueryType = OpraSchema.EntityResolverType | 'metadata' | 'execute';
export type OperationType = 'create' | 'read' | 'update' | 'patch' | 'delete' | 'execute';

export type KeyValue = string | number | boolean | object;

export type EntityInput<T> = DeepNullableIfPartial<DeepPickWritable<T>>;
export type EntityOutput<T> = DeepNullableIfPartial<T>;

export type DeepNullableIfPartial<T> = _DeepNullableIfPartial<T>;
type _DeepNullableIfPartial<T> =
    T extends Builtin ? T
        : T extends Promise<infer U> ? Promise<DeepNullableIfPartial<U>>
            : T extends (infer U)[] ? DeepNullableIfPartial<U>[]
                : { [P in keyof T]?: DeepNullableIfPartial<Exclude<T[P], undefined>> | null };
