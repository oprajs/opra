import { Type } from 'ts-gems';
import { NotAcceptableError, NotFoundError } from '../exception/index.js';
import { ResponsiveMap } from '../helpers/index.js';
import { OpraSchema } from '../schema/index.js';
import { DATATYPE_METADATA, NAMESPACE_PATTERN } from './constants.js';
import { ComplexType } from './data-type/complex-type.js';
import { DataType } from './data-type/data-type.js';
import { EnumType } from './data-type/enum-type.js';
import { SimpleType } from './data-type/simple-type.js';
import { DocumentBase } from './document-base.js';

export class TypeDocument extends DocumentBase {
  protected _designCtorMap = new Map<Type | Function, string>();
  protected _typeIndex = new Map<Type | object | string, DataType>();
  protected _typeNsMap = new Map<DataType, string>();
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
    this._designCtorMap.set(Date, 'datetime');
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

    // Try to get instance from cache
    const t = typeof arg0 === 'string'
        ? this._typeIndex.get(arg0.toLowerCase())
        : this._typeIndex.get(arg0);
    if (t)
      return t;

    // Determine name
    let name: string;
    if (typeof arg0 === 'string')
      name = arg0;
    else if (arg0 instanceof DataType)
      name = arg0.name || '';
    else {
      const metadata = typeof arg0 === 'function'
          ? Reflect.getMetadata(DATATYPE_METADATA, arg0) : arg0?.[DATATYPE_METADATA];
      if (!metadata) {
        /* istanbul ignore next */
        if (!silent)
          throw new TypeError('Invalid argument');
        return;
      }
      name = metadata.name;
    }

    // If cached as null, it means "not found" before
    if (t === null) {
      if (silent) return;
      throw new Error(`Data type "${name}" does not exists`);
    }

    let dataType: DataType | undefined;
    let ns = '';

    if (typeof arg0 === 'string' && arg0) {
      const m = NAMESPACE_PATTERN.exec(arg0);
      if (!m)
        throw new TypeError(`Invalid data type name "${name}"`);
      // If given string has namespace pattern (ns:type_name)
      if (m[2]) {
        ns = m[1];
        const ref = this.references.get(ns);
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
          const references = Array.from(this.references.keys()).reverse();
          for (const refNs of references) {
            const ref = this.references.get(refNs) as TypeDocument;
            dataType = ref.getDataType(name, true);
            if (dataType) {
              ns = refNs;
              break;
            }
          }
        }
      }
    } else {
      const types = Array.from(this.types.values()).reverse();
      for (const dt of types) {
        if (dt === arg0 ||
            ((dt instanceof ComplexType || dt instanceof EnumType) && dt.isTypeOf(arg0))
        ) {
          dataType = dt;
          break;
        }
      }
      // if not found, search in references (from last to first)
      if (!dataType) {
        const references = Array.from(this.references.keys()).reverse();
        for (const refNs of references) {
          const ref = this.references.get(refNs) as TypeDocument;
          dataType = ref.getDataType(arg0, true);
          if (dataType) {
            ns = refNs;
            break;
          }
        }
      }
    }

    if (dataType) {
      this._typeIndex.set(arg0, dataType);
      if (ns)
        this._typeNsMap.set(dataType, ns);
      return dataType;
    }
    if (!silent)
      throw new NotFoundError(`Data type "${name}" does not exists`);
    return;

    /* istanbul ignore next */
    if (!silent)
      throw new TypeError('Invalid argument');
  }

  /**
   * Returns NS of datatype. Returns undefined if not found
   * @param nameOrCtor
   * @param silent
   */
  getDataTypeNs(nameOrCtor: any, silent: true): string | undefined;
  /**
   * Returns NS of datatype. Throws error  if not found
   * @param nameOrCtor
   */
  getDataTypeNs(nameOrCtor: any): string;
  /**
   *
   */
  getDataTypeNs(arg0: any, silent?: boolean): string | undefined {
    const dt = this.getDataType(arg0, silent as any);
    if (dt)
      return this._typeNsMap.get(dt);
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
    const t = this.getDataType(nameOrCtor, silent as any);
    if (t) {
      if (t && t.kind === OpraSchema.ComplexType.Kind)
        return t as ComplexType;
      throw new NotAcceptableError(`Data type "${t.name}" is not a ComplexType`);
    }
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
    const t = this.getDataType(nameOrCtor, silent as any);
    if (t) {
      if (t && t.kind === OpraSchema.SimpleType.Kind)
        return t as SimpleType;
      throw new NotAcceptableError(`Data type "${t.name || t}" is not a SimpleType`);
    }
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
        references[ns] = r.exportSchema(options);
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
    this._typeIndex.clear();
    this._typeNsMap.clear();
  }

}
