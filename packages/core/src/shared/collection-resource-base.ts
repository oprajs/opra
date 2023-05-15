import { Collection, METADATA_KEY, OpraSchema } from '@opra/common';

export namespace CollectionResourceBase {
  export interface Options {
    defaultLimit?: number;
    operations?: (keyof OpraSchema.Collection.Operations)[]
  }
}

export class CollectionResourceBase {
  defaultLimit?: number;

  constructor(
      options?: CollectionResourceBase.Options
  ) {
    this.defaultLimit = options?.defaultLimit || 100;
    if (options?.operations) {
      const m: Collection.Metadata = Reflect.getMetadata(METADATA_KEY, Object.getPrototypeOf(this).constructor);
      if (m?.operations)
        Object.keys(m.operations).forEach(k => {
          if (!options.operations?.includes(k as any)) {
            const operation = m.operations[k];
            this[operation.handlerName] = null;
          }
        })
    }
  }
}
