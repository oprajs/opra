export const nodeInspectCustom = Symbol.for('nodejs.util.inspect.custom');

export type ResourceKey = string | Record<string, string> | undefined;

export type InternalFormatName = 'boolean' | 'integer' | 'number' | 'string' |
  'filter' | 'date';

export type Maybe<T> = T | undefined;
export type Nullable<T> = T | undefined | null;

export type QueryParseFunction = (value: string, key: string) => any;
