import { singletonMethods } from '../../constants.js';
import { OpraSchema } from '../../opra-schema.definition.js';
import { ComplexType } from '../data-type/complex-type.js';
import type { OpraDocument } from '../opra-document.js';
import { ResourceInfo } from './resource-info.js';

export class SingletonResourceInfo extends ResourceInfo {
  declare readonly metadata: OpraSchema.SingletonResource;
  readonly dataType: ComplexType;

  constructor(
      document: OpraDocument,
      name: string,
      dataType: ComplexType,
      metadata: OpraSchema.SingletonResource
  ) {
    // noinspection SuspiciousTypeOfGuard
    if (!(dataType instanceof ComplexType))
      throw new TypeError(`You should provide a ComplexType as "dataType" argument`);
    super(document, name, metadata);
    this.dataType = dataType;
  }

  get create() {
    return this.metadata.create;
  }

  get delete() {
    return this.metadata.delete;
  }

  get get() {
    return this.metadata.get;
  }

  get update() {
    return this.metadata.update;
  }

  getSchema(jsonOnly?: boolean): OpraSchema.SingletonResource {
    const out = super.getSchema(jsonOnly) as OpraSchema.SingletonResource;
    for (const k of singletonMethods) {
      if (typeof out[k] === 'object' && !Object.keys(out[k]).length)
        out[k] = true;
    }
    return out;
  }

}
