import { Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { DATATYPE_METADATA } from '../constants.js';
import { DataType } from '../data-type/data-type.js';

const kMap = Symbol.for('kMap');
const kCtorMap = Symbol.for('kCtorMap');

/**
 * @class DataTypeMap
 */
export class DataTypeMap {
  protected [kMap] = new ResponsiveMap<DataType>();
  protected [kCtorMap] = new WeakMap<Type | Function | object, string>();

  get size(): number {
    return this[kMap].size;
  }

  forEach(callbackFn: (value: DataType, key: string, map: ReadonlyMap<string, DataType>) => void, thisArg?: any): void {
    this[kMap].forEach(callbackFn, thisArg);
  }

  get(nameOrCtor: string | Type | Function | object): DataType | undefined {
    let name = typeof nameOrCtor === 'string' ? nameOrCtor : this[kCtorMap].get(nameOrCtor);
    if (!name && typeof nameOrCtor === 'function') {
      const metadata = Reflect.getMetadata(DATATYPE_METADATA, nameOrCtor);
      name = metadata?.name;
    }
    if (!name && typeof nameOrCtor === 'object') {
      const metadata = nameOrCtor[DATATYPE_METADATA];
      name = metadata?.name;
    }
    return name ? this[kMap].get(name) : undefined;
  }

  set(name: string, dataType: DataType) {
    this[kMap].set(name, dataType);
    if ((dataType as any).ctor) this[kCtorMap].set((dataType as any).ctor, name);
    else if ((dataType as any).instance) this[kCtorMap].set((dataType as any).instance, name);
  }

  has(nameOrCtor: string | Type | Function | object | DataType): boolean {
    if (nameOrCtor instanceof DataType) return !!nameOrCtor.name && this[kMap].has(nameOrCtor.name);
    const name = typeof nameOrCtor === 'string' ? nameOrCtor : this[kCtorMap].get(nameOrCtor);
    return name ? this[kMap].has(name) : false;
  }

  keys(): IterableIterator<string> {
    return this[kMap].keys();
  }

  values(): IterableIterator<DataType> {
    return this[kMap].values();
  }

  entries(): IterableIterator<[string, DataType]> {
    return this[kMap].entries();
  }

  sort(compareFn?: (a: string, b: string) => number): this {
    this[kMap].sort(compareFn);
    return this;
  }

  [Symbol.iterator](): IterableIterator<[string, DataType]> {
    return this[kMap][Symbol.iterator]();
  }
}
