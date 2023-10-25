import { ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { Container } from './container.js';
import { CrudOperation } from './crud-operation.js';
import { Resource } from './resource.js';

export abstract class CrudResource extends Resource {
  operations = new ResponsiveMap<CrudOperation>();

  protected constructor(
      parent: ApiDocument | Container,
      init: Resource.InitArguments
  ) {
    super(parent, init);
    if (init.operations) {
      for (const [name, meta] of Object.entries(init.operations)) {
        this.operations.set(name, new CrudOperation(this, name, meta));
      }
    }
  }

  getOperation(name: string): CrudOperation | undefined {
    return this.operations.get(name);
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.ResourceBase & { operations?: any } {
    const schema = super.exportSchema(options) as any;
    if (this.operations.size) {
      schema.operations = {};
      for (const operation of this.operations.values()) {
        schema.operations[operation.name] = operation.exportSchema(options);
      }
    }
    return schema;
  }
}
