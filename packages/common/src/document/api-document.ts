import { Type } from 'ts-gems';
import { cloneObject, omitUndefined, ResponsiveMap } from '../helpers/index.js';
import { OpraSchema } from '../schema/index.js';
import { DataTypeMap } from './common/data-type-map.js';
import { DocumentElement } from './common/document-element.js';
import { BUILTIN, kDataTypeMap, kTypeNSMap, NAMESPACE_PATTERN } from './constants.js';
import { DataType } from './data-type/data-type.js';
import type { EnumType } from './data-type/enum-type.js';
import type { HttpApi } from './http/http-api.js';

export namespace ApiDocument {
  export interface ExportOptions {
    references?: 'inline' | 'relative' | 'url';
  }
}

/**
 *
 * @class ApiDocument
 */
export class ApiDocument extends DocumentElement {
  protected [kTypeNSMap] = new WeakMap<DataType, string>();
  url?: string;
  info: OpraSchema.DocumentInfo;
  references = new ResponsiveMap<ApiDocument>();
  types = new DataTypeMap();
  api?: HttpApi;

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
    nameOrCtor: string | Type | Function | EnumType.EnumArray | EnumType.EnumObject | DataType,
  ): string | undefined {
    const dt =
      nameOrCtor instanceof DataType ? this._findDataType(nameOrCtor.name || '') : this._findDataType(nameOrCtor);
    if (dt) return this[kTypeNSMap].get(dt);
  }

  toJSON(): OpraSchema.ApiDocument {
    return this.export();
  }

  /**
   * Export as Opra schema definition object
   */
  export(options?: ApiDocument.ExportOptions): OpraSchema.ApiDocument {
    const out = omitUndefined<OpraSchema.ApiDocument>({
      spec: OpraSchema.SpecVersion,
      url: this.url,
      info: cloneObject(this.info, true),
      // api: this.api ? this.api.toJSON() : undefined,
    });
    if (this.references.size) {
      let i = 0;
      const references: any = {};
      for (const [ns, doc] of this.references.entries()) {
        if (doc[BUILTIN]) continue;
        if (options?.references === 'url') {
          if (doc.url) references[ns] = doc.url;
          else references[ns] = `/$schema?ns=${ns}`;
        } else if (options?.references === 'relative') references[ns] = `/$schema?ns=${ns}`;
        else references[ns] = doc.export(options);
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

  protected _findDataType(
    nameOrCtor: string | Type | Function | EnumType.EnumArray | EnumType.EnumObject,
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
