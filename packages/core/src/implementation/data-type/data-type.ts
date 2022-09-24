import { Type } from 'ts-gems';
import { OpraSchema } from '@opra/schema';
import { cloneObject } from '../../utils/clone-object.util.js';
import type { OpraDocument } from '../opra-document.js';

export abstract class DataType {
  protected _owner: OpraDocument;
  protected readonly _metadata: OpraSchema.BaseDataType;
  readonly base?: DataType

  protected constructor(owner: OpraDocument, metadata: OpraSchema.DataType, base?: DataType) {
    this._owner = owner;
    this._metadata = metadata;
    if (base) {
      this.base = base;
      Object.setPrototypeOf(this._metadata, base._metadata);
    }
  }

  get owner(): OpraDocument {
    return this._owner;
  }

  get kind(): OpraSchema.DataTypeKind {
    return this._metadata.kind;
  }

  get name(): string {
    return this._metadata.name;
  }

  get description(): string | undefined {
    return this._metadata.description;
  }

  get ctor(): Type | undefined {
    return this._metadata.ctor;
  }

  is(typeName: string): boolean {
    return this.name === typeName || !!(this.base && this.base.is(typeName));
  }

  getMetadata(jsonOnly?: boolean): any {
    return cloneObject(this._metadata, jsonOnly);
  }

}
