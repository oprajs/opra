import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { ApiOperation } from './api-operation.js';
import type { Container } from './container';
import { CrudResource } from './crud-resource.js';
import type { Storage } from './storage.js';
import type { StorageDecorator } from './storage-decorator';

export class StorageClass extends CrudResource {
  readonly kind: OpraSchema.Resource.Kind = OpraSchema.Storage.Kind;

  constructor(parent: ApiDocument | Container, init: Storage.InitArguments) {
    super(parent, init);
  }

  getOperation(name: 'delete'): (ApiOperation & Omit<StorageDecorator.Delete.Metadata, keyof ApiOperation>) | undefined;
  getOperation(name: 'get'): (ApiOperation & Omit<StorageDecorator.Get.Metadata, keyof ApiOperation>) | undefined;
  getOperation(name: 'post'): (ApiOperation & Omit<StorageDecorator.Post.Metadata, keyof ApiOperation>) | undefined;
  getOperation(name: string): ApiOperation | undefined {
    return super.getOperation(name);
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Storage {
    return super.exportSchema(options) as OpraSchema.Storage;
  }

}
