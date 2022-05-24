export const nodeInspectCustom = Symbol.for('nodejs.util.inspect.custom');

export type ResourceKey = string | Record<string, string> | undefined;

export type Nullable<T> = T | undefined | null;
