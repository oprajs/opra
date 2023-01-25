import { collectionMethods } from '../../constants.js';
import { OpraSchema } from '../../opra-schema.definition.js';
import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import { ComplexType } from '../data-type/complex-type.js';
import type { OpraDocument } from '../opra-document';
import { ResourceInfo } from './resource-info.js';


export class CollectionResourceInfo extends ResourceInfo {
  declare readonly metadata: OpraSchema.CollectionResource;
  readonly dataType: ComplexType;

  constructor(
      document: OpraDocument,
      name: string,
      dataType: ComplexType,
      metadata: OpraSchema.CollectionResource
  ) {
    if (!metadata.keyFields)
      throw new TypeError(`You should provide key fields for ${name}`);
    super(document, name, metadata);
    metadata.keyFields = Array.isArray(metadata.keyFields) ? metadata.keyFields : [metadata.keyFields];
    metadata.keyFields.forEach(f => dataType.getField(f));
    this.dataType = dataType;
    if (metadata.search && metadata.search.sortFields) {
      metadata.search.sortFields = normalizeFieldArray(document, dataType, metadata.search.sortFields);
    }
  }

  get instance() {
    return this.metadata.instance;
  }

  get keyFields(): string[] {
    return this.metadata.keyFields as string[];
  }

  get create() {
    return this.metadata.create;
  }

  get count() {
    return this.metadata.count;
  }

  get delete() {
    return this.metadata.delete;
  }

  get deleteMany() {
    return this.metadata.deleteMany;
  }

  get get() {
    return this.metadata.get;
  }

  get update() {
    return this.metadata.update;
  }

  get updateMany() {
    return this.metadata.updateMany;
  }

  get search() {
    return this.metadata.search;
  }

  getHandlerNames(): string[] {
    const out: string[] = [];
    collectionMethods.forEach(m => {
      if (this.metadata[m])
        out.push(m);
    });
    return out;
  }

  getHandler(method: string): Function {
    const r = this.metadata[method];
    return r && r.handler;
  }

  getSchema(jsonOnly?: boolean): OpraSchema.CollectionResource {
    const out = super.getSchema(jsonOnly) as OpraSchema.CollectionResource;
    if (out.keyFields.length < 2)
      out.keyFields = out.keyFields[0];
    for (const k of collectionMethods) {
      if (typeof out[k] === 'object' && !Object.keys(out[k]).length)
        out[k] = true;
    }
    return out;
  }

}
