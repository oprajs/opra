import { omitUndefined } from '@jsopen/objects';
import { md5 } from 'super-fast-md5';
import type { Mutable, Type } from 'ts-gems';
import { cloneObject, ResponsiveMap } from '../helpers/index.js';
import { OpraSchema } from '../schema/index.js';
import { DataTypeMap } from './common/data-type-map.js';
import { DocumentElement } from './common/document-element.js';
import {
  BUILTIN,
  kDataTypeMap,
  kTypeNSMap,
  NAMESPACE_PATTERN,
} from './constants.js';
import { DataType } from './data-type/data-type.js';
import type { EnumType } from './data-type/enum-type.js';
import { HttpApi } from './http/http-api.js';
import { RpcApi } from './rpc/rpc-api.js';

/**
 *
 * @class ApiDocument
 */
export class ApiDocument extends DocumentElement {
  protected [kTypeNSMap] = new WeakMap<DataType, string>();
  readonly id: string = '';
  url?: string;
  info: OpraSchema.DocumentInfo = {};
  references = new ResponsiveMap<ApiDocument>();
  types = new DataTypeMap();
  api?: HttpApi | RpcApi;

  constructor() {
    super(null as any);
    this.node[kDataTypeMap] = this.types;
    this.node.findDataType = this._findDataType.bind(this);
  }

  /**
   * Returns NS of datatype. Returns undefined if not found
   * @param nameOrCtor
   */
  getDataTypeNs(
    nameOrCtor:
      | string
      | Type
      | Function
      | EnumType.EnumArray
      | EnumType.EnumObject
      | DataType,
  ): string | undefined {
    const dt =
      nameOrCtor instanceof DataType
        ? this._findDataType(nameOrCtor.name || '')
        : this._findDataType(nameOrCtor);
    if (dt) return this[kTypeNSMap].get(dt);
  }

  findDocument(id: string): ApiDocument | undefined {
    if (this.id === id) return this;
    for (const doc of this.references.values()) {
      if (doc.id === id) return doc;
      const d = doc.findDocument(id);
      if (d) return d;
    }
  }

  get httpApi(): HttpApi {
    if (!(this.api && this.api instanceof HttpApi)) {
      throw new TypeError('The document do not contains HttpApi instance');
    }
    return this.api as HttpApi;
  }

  get rpcApi(): RpcApi {
    if (!(this.api && this.api instanceof RpcApi)) {
      throw new TypeError('The document do not contains RpcApi instance');
    }
    return this.api as RpcApi;
  }

  toJSON(): OpraSchema.ApiDocument {
    return this.export();
  }

  /**
   * Export as Opra schema definition object
   */
  export(): OpraSchema.ApiDocument {
    const out = omitUndefined<OpraSchema.ApiDocument>({
      spec: OpraSchema.SpecVersion,
      id: this.id,
      url: this.url,
      info: cloneObject(this.info, true),
    });
    if (this.references.size) {
      let i = 0;
      const references: Record<string, OpraSchema.DocumentReference> = {};
      for (const [ns, doc] of this.references.entries()) {
        if (doc[BUILTIN]) continue;
        references[ns] = {
          id: doc.id,
          url: doc.url,
          info: cloneObject(doc.info, true),
        };
        i++;
      }
      if (i) out.references = references;
    }
    if (this.types.size) {
      out.types = {};
      for (const v of this.types.values()) {
        out.types[v.name!] = v.toJSON();
      }
    }
    if (this.api) out.api = this.api.toJSON();
    return out;
  }

  invalidate(): void {
    /** Generate id */
    const x = this.export();
    delete (x as any).id;
    (this as Mutable<ApiDocument>).id = md5(JSON.stringify(x));
    /** Clear [kTypeNSMap] */
    this[kTypeNSMap] = new WeakMap<DataType, string>();
  }

  protected _findDataType(
    nameOrCtor:
      | string
      | Type
      | Function
      | EnumType.EnumArray
      | EnumType.EnumObject,
    visitedRefs?: WeakMap<ApiDocument, boolean>,
  ): DataType | undefined {
    let result = this.types.get(nameOrCtor);

    if (result || !this.references.size) return result;

    // Lookup for references
    if (typeof nameOrCtor === 'string') {
      // If given string has namespace pattern (ns:type_name)
      const m = NAMESPACE_PATTERN.exec(nameOrCtor);
      if (m) {
        const ns = m[1];
        if (ns) {
          const ref = this.references.get(ns);
          if (!ref) return;
          visitedRefs = visitedRefs || new WeakMap<ApiDocument, boolean>();
          visitedRefs.set(this, true);
          visitedRefs.set(ref, true);
          return ref._findDataType(m[2], visitedRefs);
        }
        nameOrCtor = m[2];
      }
    }

    // if not found, search in references (from last to first)
    visitedRefs = visitedRefs || new WeakMap<ApiDocument, boolean>();
    visitedRefs.set(this, true);
    const references = Array.from(this.references.keys()).reverse();
    /** First step, lookup for own types */
    for (const refNs of references) {
      const ref = this.references.get(refNs);
      result = ref?.types.get(nameOrCtor);
      if (result) {
        this[kTypeNSMap].set(result, ref?.[BUILTIN] ? '' : refNs);
        return result;
      }
    }
    /** If not found lookup for child references */
    for (const refNs of references) {
      const ref = this.references.get(refNs);
      visitedRefs.set(ref!, true);
      result = ref!._findDataType(nameOrCtor, visitedRefs);
      if (result) {
        this[kTypeNSMap].set(result, ref?.[BUILTIN] ? '' : refNs);
        return result;
      }
    }
  }
}
