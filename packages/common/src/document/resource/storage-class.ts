import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { Container } from './container';
import type { CrudOperation } from './crud-operation.js';
import { CrudResource } from './crud-resource.js';
import type { Storage } from './storage.js';
import type { StorageDecorator } from './storage-decorator';

export class StorageClass extends CrudResource {
  readonly kind: OpraSchema.Resource.Kind = OpraSchema.Storage.Kind;

  constructor(parent: ApiDocument | Container, init: Storage.InitArguments) {
    super(parent, init);
  }

  getOperation(name: 'delete'): (CrudOperation & Omit<StorageDecorator.Delete.Metadata, keyof CrudOperation>) | undefined;
  getOperation(name: 'get'): (CrudOperation & Omit<StorageDecorator.Get.Metadata, keyof CrudOperation>) | undefined;
  getOperation(name: 'post'): (CrudOperation & Omit<StorageDecorator.Post.Metadata, keyof CrudOperation>) | undefined;
  getOperation(name: string): CrudOperation | undefined {
    return super.getOperation(name);
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Storage {
    return super.exportSchema(options) as OpraSchema.Storage;
  }

}
