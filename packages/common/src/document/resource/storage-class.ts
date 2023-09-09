import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { Endpoint } from './endpoint.js';
import { Resource } from './resource.js';
import type { Storage } from './storage.js';

export class StorageClass extends Resource {
  readonly kind = OpraSchema.Storage.Kind;

  constructor(document: ApiDocument, init: Storage.InitArguments) {
    super(document, init);
    this.controller = init.controller;
  }

  getOperation(name: 'delete'): (Endpoint & OpraSchema.Storage.Operations.Delete) | undefined;
  getOperation(name: 'get'): (Endpoint & OpraSchema.Storage.Operations.Get) | undefined;
  getOperation(name: 'post'): (Endpoint & OpraSchema.Storage.Operations.Post) | undefined;
  getOperation(name: string): Endpoint | undefined {
    return super.getOperation(name);
  }

  exportSchema(): OpraSchema.Storage {
    return super.exportSchema() as OpraSchema.Storage;
  }

}
