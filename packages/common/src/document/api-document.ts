import { Type } from 'ts-gems';
import { cloneObject, ResponsiveMap } from '../helpers/index.js';
import { OpraSchema } from '../schema/index.js';
import { ApiDocumentElement } from './api-document-element.js';
import { ApiService } from './api-service.js';
import { NAMESPACE_PATTERN } from './constants.js';
import { DataType } from './data-type/data-type.js';
import { HttpService } from './http/http-service.js';

export class ApiDocument extends ApiDocumentElement {
  protected _typeNsMap = new WeakMap<DataType, string>();
  url?: string;
  info: OpraSchema.DocumentInfo;
  references = new ResponsiveMap<ApiDocument>();
  services = new ResponsiveMap<ApiService>();

  constructor() {
    super()
    this.info = {
      version: '',
      title: ''
    }
  }

  /**
   * Returns DataType instance by name or Constructor. Returns undefined if not found
   * @param nameOrCtor
   */
  findDataType(nameOrCtor: string | Type | Function | object): DataType | undefined {
    return this._findDataType(nameOrCtor);
  }

  /**
   * Returns NS of datatype. Returns undefined if not found
   * @param nameOrCtor
   */
  getDataTypeNs(nameOrCtor: string | Type | Function | object | DataType): string | undefined {
    const dt = nameOrCtor instanceof DataType
        ? this.findDataType(nameOrCtor.name || '')
        : this.findDataType(nameOrCtor);
    if (dt)
      return this._typeNsMap.get(dt);
  }

  /**
   * Returns ApiService instance by name. Returns undefined if not found
   * @param name
   */
  getService(name: string): ApiService {
    const service = this.services.get(name);
    if (!service)
      throw new TypeError(`Service "${name}" not found in api schema`);
    return service;
  }

  getHttpService(name: string): HttpService {
    const t = this.getService(name);
    if (t instanceof HttpService)
      return t;
    throw new TypeError(`"${t.name}" is not an HttpService`);
  }


  /**
   * Export as Opra schema definition object
   */
  toJSON(): OpraSchema.ApiDocument {
    const schema = {
      spec: OpraSchema.SpecVersion,
      url: this.url,
      info: cloneObject(this.info, true),
      ...super.toJSON()
    } as OpraSchema.ApiDocument;
    if (this.references.size) {
      const references = {};
      let i = 0;
      for (const [ns, r] of this.references.entries()) {
        if (ns.toLowerCase() === 'opra')
          continue;
        references[ns] = r.toJSON();
        i++;
      }
      if (i)
        schema.references = references;
    }
    if (this.services.size) {
      const services = {};
      let i = 0;
      for (const [name, r] of this.services.entries()) {
        services[name] = r.toJSON();
        i++;
      }
      if (i)
        schema.services = services;
      // schema.http = omitUndefined({
      //   ...this.http.toJSON(),
      //   kind: undefined,
      //   description: undefined,
      //   name: undefined
      // }) as OpraSchema.HttpRoot;
    }
    return schema;
  }

  protected _findDataType(
      nameOrCtor: string | Type | Function | object,
      visitedRefs?: WeakMap<ApiDocument, boolean>
  ): DataType | undefined {
    let result = super.findDataType(nameOrCtor);
    if (result || !this.references.size)
      return result;

    // Lookup for references

    if (typeof nameOrCtor === 'string') {
      // If given string has namespace pattern (ns:type_name)
      const m = NAMESPACE_PATTERN.exec(nameOrCtor);
      if (m) {
        const ns = m[1];
        const ref = this.references.get(ns);
        if (!ref)
          return;
        visitedRefs = visitedRefs || new WeakMap<ApiDocument, boolean>();
        visitedRefs.set(this, true);
        visitedRefs.set(ref, true);
        result = ref._findDataType(m[2], visitedRefs);
        if (result)
          this._typeNsMap.set(result, ns);
        return result;
      }
    }

    // if not found, search in references (from last to first)
    visitedRefs = visitedRefs || new WeakMap<ApiDocument, boolean>();
    visitedRefs.set(this, true);
    const references = Array.from(this.references.keys()).reverse();
    for (const refNs of references) {
      const ref = this.references.get(refNs);
      visitedRefs.set(ref!, true);
      result = ref!._findDataType(nameOrCtor, visitedRefs);
      if (result) {
        this._typeNsMap.set(result, refNs);
        return result;
      }
    }
  }

}
