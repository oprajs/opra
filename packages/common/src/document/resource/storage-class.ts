import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { Resource } from './resource.js';
import type { Storage } from './storage.js';

export class StorageClass extends Resource {
  readonly kind = OpraSchema.Storage.Kind;
  readonly operations: OpraSchema.Storage.Operations;

  constructor(
      document: ApiDocument,
      init: Storage.InitArguments
  ) {
    super(document, init);
    this.controller = init.controller;
    this.operations = {...init.operations};
  }

  exportSchema(): OpraSchema.Storage {
    return {
      ...super.exportSchema(),
      ...omitUndefined({
        kind: OpraSchema.Storage.Kind,
        operations: this.operations
      })
    };
  }

}
