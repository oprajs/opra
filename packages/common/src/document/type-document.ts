import { Type } from 'ts-gems';
import { NotAcceptableError, NotFoundError } from '../exception/index.js';
import { ResponsiveMap } from '../helpers/index.js';
import { OpraSchema } from '../schema/index.js';
import { DATATYPE_METADATA, NAMESPACE_PATTERN } from './constants.js';
import { ComplexType } from './data-type/complex-type.js';
import type { DataType } from './data-type/data-type.js';
import { EnumType } from './data-type/enum-type.js';
import { SimpleType } from './data-type/simple-type.js';
import { DocumentBase } from './document-base.js';

export class TypeDocument extends DocumentBase {
  protected _designCtorMap = new Map<Type | Function, string>();
  protected _typeCache = new ResponsiveMap<DataType>();
  protected _typesCacheByCtor = new Map<Type | object, DataType>();
  references = new ResponsiveMap<TypeDocument>();
  types = new ResponsiveMap<DataType>();

  constructor() {
    super()
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
  getDataType(nameOrCtor: any, silent: true): DataType | undefined;
  /**
   * Returns DataType instance by name or Constructor. Throws error  if not found
   * @param nameOrCtor
   */
  getDataType(nameOrCtor: any): DataType;
  /**
   *
   */
  getDataType(arg0: any, silent?: boolean): DataType | undefined {
    // Convert design ctor to type name (String -> 'string')
    if (typeof arg0 === 'function') {
      const x = this._designCtorMap.get(arg0);
      if (x) arg0 = x;
    }

    let dataType: DataType | undefined;
    let name: string;
    // Determine name
    if (typeof arg0 === 'function') {
      const metadata = Reflect.getMetadata(DATATYPE_METADATA, arg0);
      name = metadata?.name || arg0.name;
    } else if (typeof arg0 === 'function') {
      const metadata = Reflect.getMetadata(DATATYPE_METADATA, arg0);
      name = metadata?.name;
    } else name = String(arg0);

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

    if (typeof arg0 === 'string' && arg0) {
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
        throw new Error(`No data type mapping found for class "${name}"`);
      return;
    }

    if (typeof arg0 === 'object') {
      const metadata = arg0[DATATYPE_METADATA];
      if (metadata && metadata.name) {
        dataType = this.getDataType(metadata.name, true);
        if (dataType)
          return dataType;
        if (!silent)
          throw new Error(`No data type mapping found for class "${name}"`);
      }
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
   Returns SimpleType instance by name or Constructor.
   Throws error undefined if not found or data type is not a SimpleType
   * @param nameOrCtor
   */
  getEnumType(nameOrCtor: string | EnumType.EnumObject | EnumType.EnumArray): EnumType
  getEnumType(nameOrCtor: string | EnumType.EnumObject | EnumType.EnumArray, silent?: true): EnumType | undefined {
    const t = this.getDataType(nameOrCtor);
    if (!t && silent)
      return;
    if (t && t.kind === OpraSchema.EnumType.Kind)
      return t as EnumType;
    throw new NotAcceptableError(`Data type "${t.name || t}" is not a EnumType`);
  }

  /**
   * Export as Opra schema definition object
   */
  exportSchema(options?: { webSafe?: boolean }): OpraSchema.TypeDocument {
    const schema = super.exportSchema() as OpraSchema.TypeDocument;
    if (this.references.size) {
      const references = {};
      let i = 0;
      for (const [ns, r] of this.references.entries()) {
        if (ns.toLowerCase() === 'opra')
          continue;
        references[ns] = r.url ? r.url : r.exportSchema(options);
        i++;
      }
      if (i)
        schema.references = references;
    }
    if (this.types.size) {
      const types = schema.types = {};
      for (const [name, r] of this.types.entries()) {
        types[name] = r.exportSchema(options);
      }
    }
    return schema;
  }

  invalidate() {
    this._typeCache.clear();
    this._typesCacheByCtor.clear();
  }

}
