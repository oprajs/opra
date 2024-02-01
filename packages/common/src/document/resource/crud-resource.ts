import { ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { ApiOperation } from './api-operation.js';
import type { Container } from './container.js';
import { Resource } from './resource.js';

export abstract class CrudResource extends Resource {
  operations = new ResponsiveMap<ApiOperation>();

  protected constructor(
      parent: ApiDocument | Container,
      init: Resource.InitArguments
  ) {
    super(parent, init);
    if (init.operations) {
      for (const [name, meta] of Object.entries(init.operations)) {
        this.operations.set(name, new ApiOperation(this, name, meta));
      }
    }
  }

  getOperation(operation: string): ApiOperation | undefined {
    const op = this.operations.get(operation);
    if (!op)
      throw new Error(`${this.name} resource does not support "${operation}" operations`);
    return op;
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Resource & { operations?: any } {
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
