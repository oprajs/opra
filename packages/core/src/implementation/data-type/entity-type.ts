import { StrictOmit } from 'ts-gems';
import { SqbConnect } from '@opra/optionals';
import { OpraSchema } from '@opra/schema';
import { OpraDocument } from '../opra-document.js';
import { ComplexType } from './complex-type.js';

export type EntityTypeArgs = StrictOmit<OpraSchema.EntityType, 'kind'>;

export class EntityType extends ComplexType {
  declare protected readonly _args: StrictOmit<EntityTypeArgs, 'properties'>;

  constructor(owner: OpraDocument, args: EntityTypeArgs, base?: ComplexType | EntityType) {
    super(owner, {
      ...args
    }, base);
    (this._args as any).kind = 'EntityType';

    // Try to determine primary key info from SQB
    if (args.ctor) {
      const sqbEntity = SqbConnect.EntityMetadata.get(args.ctor);
      if (sqbEntity?.indexes) {
        const primaryIndex = sqbEntity.indexes.find(x => x.primary);
        if (primaryIndex) {
          if (primaryIndex.columns.length > 1)
            throw new TypeError(`Multi-key indexes is not implemented yet`);
          this._args.primaryKey = primaryIndex.columns[0];
        }
      }
    }
    if (!this.primaryKey)
      throw new TypeError(`You must provide primaryKey fo "${this.name}" entity`);
    if (!this.getProperty(this.primaryKey))
      throw new TypeError(`"${this.name}" entity has no such property named "${this.primaryKey}" which defined as primary key`);
  }

  get primaryKey(): string {
    return this._args.primaryKey;
  }

}
