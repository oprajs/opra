import { StrictOmit } from 'ts-gems';
import * as Optionals from '@opra/optionals';
import { OpraSchema } from '../../opra-schema.js';
import { OpraDocument } from '../opra-document.js';
import { ComplexType } from './complex-type.js';

export type EntityTypeArgs = StrictOmit<OpraSchema.EntityType, 'kind'>;

export class EntityType extends ComplexType {
  // @ts-ignore
  declare protected readonly _metadata: OpraSchema.EntityType;

  constructor(owner: OpraDocument, metadata: EntityTypeArgs) {
    super(owner, metadata);
    this._metadata.kind = 'EntityType';

    if (!this.primaryKey && metadata.extends) {
      for (const ext of metadata.extends) {
        const baseType = owner.getDataType(ext.type);
        if (baseType instanceof EntityType && baseType.primaryKey) {
          this._metadata.primaryKey = baseType.primaryKey;
          break;
        }
      }
    }

    // Try to determine primary key info from SQB
    if (!this.primaryKey && Optionals.SqbConnect && metadata.ctor) {
      const sqbEntity = Optionals.SqbConnect.EntityMetadata.get(metadata.ctor);
      if (sqbEntity?.indexes) {
        const primaryIndex = sqbEntity.indexes.find(x => x.primary);
        if (primaryIndex) {
          if (primaryIndex.columns.length > 1)
            throw new TypeError(`Multi-key indexes is not implemented yet`);
          this._metadata.primaryKey = primaryIndex.columns[0];
        }
      }
    }
    if (!this.primaryKey)
      throw new TypeError(`You must provide primaryKey fo "${this.name}" entity`);
    if (!this.getField(this.primaryKey))
      throw new TypeError(`"${this.name}" entity has no such property named "${this.primaryKey}" which defined as primary key`);
  }

  get primaryKey(): string {
    return this._metadata.primaryKey;
  }

}
