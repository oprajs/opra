import { Type } from 'ts-gems';
import { NotAcceptableError, NotFoundError } from '../exception/index.js';
import { cloneObject, omitUndefined, ResponsiveMap } from '../helpers/index.js';
import { OpraSchema } from '../schema/index.js';
import { NAMESPACE_PATTERN } from './constants.js';
import { ComplexType } from './data-type/complex-type.js';
import type { DataType } from './data-type/data-type.js';
import { SimpleType } from './data-type/simple-type.js';
import type { Collection } from './resource/collection.js';
import { Resource } from './resource/resource.js';
import { Singleton } from './resource/singleton.js';

export class ApiDocument {
  protected _typeCache = new ResponsiveMap<string, DataType | null>();
  protected _typesCacheByCtor = new Map<Type | object, DataType | null>();
  url?: string;
  info: OpraSchema.DocumentInfo;
  references = new ResponsiveMap<string, ApiDocument>();
  types = new ResponsiveMap<string, DataType>();
  resources = new ResponsiveMap<string, Resource>();

  constructor() {
    this.info = {
      version: '',
      title: ''
    }
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
  getDataType(nameOrCtor: string | Type | object, silent?: true): DataType | undefined {
    let dataType: DataType | undefined;
    if (nameOrCtor === Object)
      nameOrCtor = 'any';
    const nameOrCtorName = typeof nameOrCtor === 'function' ? nameOrCtor.name : nameOrCtor;
    // Try to get instance from cache
    const t = typeof nameOrCtor === 'string'
        ? this._typeCache.get(nameOrCtor)
        : this._typesCacheByCtor.get(nameOrCtor);
    if (t)
      return t;
    if (t === null) {
      if (silent) return;
      throw new NotFoundError(`Data type "${nameOrCtorName}" does not exists`);
    }

    if (typeof nameOrCtor === 'string') {
      const m = NAMESPACE_PATTERN.exec(nameOrCtor);
      if (!m)
        throw new NotFoundError(`Invalid data type name "${nameOrCtorName}"`);
      // If given string has namespace pattern (ns:type_name)
      if (m[2]) {
        const ref = this.references.get(m[1]);
        if (!ref) {
          if (silent) return;
          throw new NotFoundError(`Reference "${m[1]}" not found`);
        }
        dataType = ref.getDataType(m[2]);
        this._typeCache.set(nameOrCtor, dataType);
      } else {
        const name = m[1];
        // Get instance from own types
        dataType = this.types.get(name);
        // if not found, search in references (from last to first)
        if (!dataType) {
          const references = Array.from(this.references.values()).reverse();
          for (const ref of references) {
            dataType = ref.getDataType(name);
            if (dataType)
              break;
          }
        }
        if (dataType)
          this._typeCache.set(dataType.name || name, dataType);
      }
    } else if (typeof nameOrCtor === 'function') {
      const types = Array.from(this.types.values()).reverse();
      for (const dt of types) {
        if ((dt instanceof ComplexType || dt instanceof SimpleType) && dt.own.ctor === nameOrCtor) {
          dataType = dt;
          break;
        }
      }
      // if not found, search in references (from last to first)
      if (!dataType) {
        const references = Array.from(this.references.values()).reverse();
        for (const ref of references) {
          dataType = ref.getDataType(nameOrCtor, true);
          if (dataType)
            break;
        }
      }
    }

    if (dataType) {
      if ((dataType instanceof ComplexType || dataType instanceof SimpleType) &&
          dataType.own?.ctor && dataType.own.ctor !== Object)
        this._typesCacheByCtor.set(dataType.own.ctor, dataType);
      return dataType;
    } else {
      if (typeof nameOrCtor === 'string')
        this._typeCache.set(nameOrCtor, null);
      else this._typesCacheByCtor.set(nameOrCtor, null);
    }
    if (silent) return;
    throw new NotFoundError(`Data type "${nameOrCtorName}" does not exists`);
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
    throw new NotFoundError(`Resource not found (${path})`);
  }

  /**
   * Returns Collection resource instance by path
   * Returns undefined if not found
   * Throws error if resource is not a Collection
   * @param path
   * @param silent
   */

  getCollection(path: string, silent: true): Collection | undefined
  /**
   * Returns ComplexType instance by name or Constructor.
   * Throws error undefined if not found or data type is not a ComplexType
   * @param path
   */
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
  /**
   * Returns ComplexType instance by name or Constructor.
   * Throws error undefined if not found or data type is not a ComplexType
   * @param path
   */
  getSingleton(path: string): Singleton
  getSingleton(path: string, silent?: true): Singleton | undefined {
    const t = this.getResource(path);
    if (!t && silent)
      return;
    if (t && t.kind === OpraSchema.Singleton.Kind)
      return t as Singleton;
    throw new NotAcceptableError(`Resource type "${t.name}" is not a Singleton`);
  }

  /**
   * Export as Opra schema definition object
   */
  exportSchema(): OpraSchema.ApiDocument {
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
    return omitUndefined(schema);
  }

  invalidate() {
    this._typeCache.clear();
    this._typesCacheByCtor.clear();
  }

}
