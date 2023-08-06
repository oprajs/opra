import { Type } from 'ts-gems';
import { NotAcceptableError, NotFoundError, ResourceNotFoundError } from '../exception/index.js';
import { cloneObject, ResponsiveMap } from '../helpers/index.js';
import { OpraSchema } from '../schema/index.js';
import { NAMESPACE_PATTERN } from './constants.js';
import { ComplexType } from './data-type/complex-type.js';
import type { DataType } from './data-type/data-type.js';
import { SimpleType } from './data-type/simple-type.js';
import type { Collection } from './resource/collection.js';
import { Resource } from './resource/resource.js';
import { Singleton } from './resource/singleton.js';
import { Storage } from './resource/storage.js';

export class ApiDocument {
  protected _designCtorMap = new Map<Type | Function, string>();
  protected _typeCache = new ResponsiveMap<DataType>();
  protected _typesCacheByCtor = new Map<Type | object, DataType>();
  protected _metadataCache?: OpraSchema.ApiDocument;
  url?: string;
  info: OpraSchema.DocumentInfo;
  references = new ResponsiveMap<ApiDocument>();
  types = new ResponsiveMap<DataType>();
  resources = new ResponsiveMap<Resource>();

  constructor() {
    this.info = {
      version: '',
      title: ''
    }
    const BigIntConstructor = Object.getPrototypeOf(BigInt(0)).constructor;
    const BufferConstructor = Object.getPrototypeOf(Buffer.from([]));
    this._designCtorMap.set(String, 'string');
    this._designCtorMap.set(Number, 'number');
    this._designCtorMap.set(Boolean, 'boolean');
    this._designCtorMap.set(Object, 'any');
    this._designCtorMap.set(Date, 'timestamp');
    this._designCtorMap.set(BigIntConstructor, 'bigint');
    this._designCtorMap.set(ArrayBuffer, 'base64');
    this._designCtorMap.set(SharedArrayBuffer, 'base64');
    this._designCtorMap.set(BufferConstructor, 'base64');
  }

  /**
   * Returns DataType instance by name or Constructor. Returns undefined if not found
   * @param nameOrCtor
   * @param silent
   */
  getDataType(nameOrCtor: string | Type | object, silent: true): DataType | undefined;
  /**
   * Returns DataType instance by name or Constructor. Throws error  if not found
   * @param nameOrCtor
   */
  getDataType(nameOrCtor: string | Type | object): DataType;
  /**
   *
   */
  getDataType(arg0: string | Type | object, silent?: boolean): DataType | undefined {
    let dataType: DataType | undefined;
    const name: string = typeof arg0 === 'function' ? arg0.name : String(arg0);
    // Try to get instance from cache
    const t = typeof arg0 === 'string'
        ? this._typeCache.get(arg0)
        : this._typesCacheByCtor.get(arg0);
    if (t)
      return t;
    // If cached as null, it means "not found"
    if (t === null) {
      if (silent) return;
      throw new Error(`Data type "${name}" does not exists`);
    }

    // Convert design ctor to type name (String -> 'string')
    if (typeof arg0 === 'function') {
      const x = this._designCtorMap.get(arg0);
      if (x) arg0 = x;
    }

    if (typeof arg0 === 'string') {
      const m = NAMESPACE_PATTERN.exec(arg0);
      if (!m)
        throw new TypeError(`Invalid data type name "${name}"`);
      // If given string has namespace pattern (ns:type_name)
      if (m[2]) {
        const ref = this.references.get(m[1]);
        if (!ref) {
          if (silent) return;
          throw new Error(`No referenced document found for given namespace "${m[1]}"`);
        }
        dataType = ref.getDataType(m[2], silent as any);
      } else {
        // Get instance from own types
        dataType = this.types.get(arg0);
        // if not found, search in references (from last to first)
        if (!dataType) {
          const references = Array.from(this.references.values()).reverse();
          for (const ref of references) {
            dataType = ref.getDataType(name, true);
            if (dataType)
              break;
          }
        }
      }
      if (dataType) {
        this._typeCache.set(arg0, dataType);
        return dataType;
      }
      if (!silent)
        throw new NotFoundError(`Data type "${arg0}" does not exists`);
      return;
    }

    if (typeof arg0 === 'function') {
      const types = Array.from(this.types.values()).reverse();
      for (const dt of types) {
        if (dt instanceof ComplexType && dt.isTypeOf(arg0)) {
          dataType = dt;
          break;
        }
      }
      // if not found, search in references (from last to first)
      if (!dataType) {
        const references = Array.from(this.references.values()).reverse();
        for (const ref of references) {
          dataType = ref.getDataType(arg0, true);
          if (dataType)
            break;
        }
      }
      if (dataType)
        this._typesCacheByCtor.set(arg0, dataType);

      if (dataType)
        return dataType;
      if (!silent)
        throw new NotFoundError(`No data type mapping found for class "${name}"`);
      return;
    }

    /* istanbul ignore next */
    if (!silent)
      throw new TypeError('Invalid argument');
  }

  /**
   * Returns ComplexType instance by name or Constructor.
   * Returns undefined if not found
   * Throws error if data type is not a ComplexType
   * @param nameOrCtor
   * @param silent
   */

  getComplexType(nameOrCtor: string | Type, silent: true): ComplexType | undefined
  /**
   * Returns ComplexType instance by name or Constructor.
   * Throws error undefined if not found or data type is not a ComplexType
   * @param nameOrCtor
   */
  getComplexType(nameOrCtor: string | Type): ComplexType
  getComplexType(nameOrCtor: string | Type, silent?: true): ComplexType | undefined {
    if (nameOrCtor === Object)
      nameOrCtor = 'object';
    const t = this.getDataType(nameOrCtor);
    if (!t && silent)
      return;
    if (t && t.kind === OpraSchema.ComplexType.Kind)
      return t as ComplexType;
    throw new NotAcceptableError(`Data type "${t.name}" is not a ComplexType`);
  }

  /**
   * Returns SimpleType instance by name or Constructor.
   * Returns undefined if not found
   * Throws error if data type is not a SimpleType
   * @param nameOrCtor
   * @param silent
   */
  getSimpleType(nameOrCtor: string | Type, silent: true): SimpleType | undefined

  /**
   Returns SimpleType instance by name or Constructor.
   Throws error undefined if not found or data type is not a SimpleType
   * @param nameOrCtor
   */
  getSimpleType(nameOrCtor: string | Type): SimpleType
  getSimpleType(nameOrCtor: string | Type, silent?: true): SimpleType | undefined {
    const t = this.getDataType(nameOrCtor);
    if (!t && silent)
      return;
    if (t && t.kind === OpraSchema.SimpleType.Kind)
      return t as SimpleType;
    throw new NotAcceptableError(`Data type "${t.name || t}" is not a SimpleType`);
  }

  /**
   * Returns Resource instance by path. Returns undefined if not found
   * @param path
   * @param silent
   */
  getResource(path: string, silent: boolean): Resource | undefined;
  /**
   * Returns Resource instance by path. Throws error if not found
   * @param path
   */
  getResource(path: string): Resource;
  getResource(path: string, silent?: boolean): Resource | undefined {
    let resource: Resource | undefined;
    const m = NAMESPACE_PATTERN.exec(path);
    if (!m)
      throw new NotFoundError(`Invalid resource path "${path}"`);
    // If given string has namespace pattern (ns:type_name)
    if (m[2]) {
      const ref = this.references.get(m[1]);
      if (!ref) {
        if (silent) return;
        throw new NotFoundError(`Reference "${m[1]}" not found`);
      }
      return ref.getResource(m[2]);
    } else {
      const name = m[1];
      // Get instance from own types
      resource = this.resources.get(name);
      if (resource)
        return resource;
      // if not found, search in references (from last to first)
      const references = Array.from(this.references.values()).reverse();
      for (const ref of references) {
        resource = silent ? ref.getResource(name, silent) : ref.getResource(name);
        if (resource)
          return resource;
      }
    }
    if (silent) return;
    throw new ResourceNotFoundError(path);
  }

  /**
   * Returns Collection resource instance by path
   * Returns undefined if not found
   * Throws error if resource is not a Collection
   * @param path
   * @param silent
   */

  getCollection(path: string, silent: true): Collection | undefined
  getCollection(path: string): Collection
  getCollection(path: string, silent?: true): Collection | undefined {
    const t = this.getResource(path);
    if (!t && silent)
      return;
    if (t && t.kind === OpraSchema.Collection.Kind)
      return t as Collection;
    throw new NotAcceptableError(`Resource type "${t.name}" is not a Collection`);
  }

  /**
   * Returns Singleton resource instance by path
   * Returns undefined if not found
   * Throws error if resource is not a Collection
   * @param path
   * @param silent
   */

  getSingleton(path: string, silent: true): Singleton | undefined
  getSingleton(path: string): Singleton
  getSingleton(path: string, silent?: true): Singleton | undefined {
    const t = this.getResource(path);
    if (!t && silent)
      return;
    if (t && t.kind === OpraSchema.Singleton.Kind)
      return t as Singleton;
    throw new NotAcceptableError(`Resource type "${t.name}" is not a Singleton`);
  }

  getStorage(path: string, silent: true): Storage | undefined
  getStorage(path: string): Storage
  getStorage(path: string, silent?: true): Storage | undefined {
    const t = this.getResource(path);
    if (!t && silent)
      return;
    if (t && t.kind === OpraSchema.Storage.Kind)
      return t as Storage;
    throw new NotAcceptableError(`Resource type "${t.name}" is not a Storage`);
  }

  /**
   * Export as Opra schema definition object
   */
  exportSchema(options?: { webSafe?: boolean }): OpraSchema.ApiDocument {
    if (this._metadataCache)
      return cloneObject(this._metadataCache, options?.webSafe);
    const schema = {
      version: OpraSchema.SpecVersion,
      url: this.url,
      info: cloneObject(this.info) as OpraSchema.DocumentInfo
    } as OpraSchema.ApiDocument;
    if (this.references.size) {
      const references = {};
      let i = 0;
      for (const [ns, r] of this.references.entries()) {
        if (ns.toLowerCase() === 'opra')
          continue;
        references[ns] = r.url ? r.url : r.exportSchema();
        i++;
      }
      if (i)
        schema.references = references;
    }
    if (this.resources.size) {
      const resources = schema.resources = {};
      for (const [name, r] of this.resources.entries()) {
        resources[name] = r.exportSchema();
      }
    }
    if (this.types.size) {
      const types = schema.types = {};
      for (const [name, r] of this.types.entries()) {
        types[name] = r.exportSchema();
      }
    }
    this._metadataCache = schema;
    return this._metadataCache;
  }

  invalidate() {
    this._metadataCache = undefined;
    this._typeCache.clear();
    this._typesCacheByCtor.clear();
  }

}
