import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { Container } from './container';
import { CrudResource } from './crud-resource.js';
import type { Operation } from './operation.js';
import type { Storage } from './storage.js';
import type { StorageDecorator } from './storage-decorator';

export class StorageClass extends CrudResource {
  readonly kind: OpraSchema.Resource.Kind = OpraSchema.Storage.Kind;

  constructor(parent: ApiDocument | Container, init: Storage.InitArguments) {
    super(parent, init);
  }

  getOperation(name: 'delete'): (Operation & Omit<StorageDecorator.Delete.Metadata, keyof Operation>) | undefined;
  getOperation(name: 'get'): (Operation & Omit<StorageDecorator.Get.Metadata, keyof Operation>) | undefined;
  getOperation(name: 'post'): (Operation & Omit<StorageDecorator.Post.Metadata, keyof Operation>) | undefined;
  getOperation(name: string): Operation | undefined {
    return super.getOperation(name);
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Storage {
    return super.exportSchema(options) as OpraSchema.Storage;
  }

}
