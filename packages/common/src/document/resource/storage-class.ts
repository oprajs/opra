import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { Endpoint } from './endpoint.js';
import { Resource } from './resource.js';
import type { StorageDecorator } from './storage.decorator.js';
import type { Storage } from './storage.js';

export class StorageClass extends Resource {
  readonly kind = OpraSchema.Storage.Kind;

  constructor(document: ApiDocument, init: Storage.InitArguments) {
    super(document, init);
  }

  getOperation(name: 'delete'): (Endpoint & Omit<StorageDecorator.Delete.Metadata, keyof Endpoint>) | undefined;
  getOperation(name: 'get'): (Endpoint & Omit<StorageDecorator.Get.Metadata, keyof Endpoint>) | undefined;
  getOperation(name: 'post'): (Endpoint & Omit<StorageDecorator.Post.Metadata, keyof Endpoint>) | undefined;
  getOperation(name: string): Endpoint | undefined {
    return super.getOperation(name);
  }

  exportSchema(): OpraSchema.Storage {
    return super.exportSchema() as OpraSchema.Storage;
  }

}
