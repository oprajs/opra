import { Type } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.definition.js';
import { cloneObject } from '../../utils/clone-object.util.js';
import type { OpraDocument } from '../opra-document';

export abstract class DataType {
  protected _document: OpraDocument;
  protected _metadata: OpraSchema.BaseDataType;
  protected _name: string;

  protected constructor(document: OpraDocument, name, metadata: OpraSchema.DataType) {
    this._document = document;
    this._name = name;
    this._metadata = metadata;
  }

  get document(): OpraDocument {
    return this._document;
  }

  get kind(): OpraSchema.DataTypeKind {
    return this._metadata.kind;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._metadata.description;
  }

  get ctor(): Type | undefined {
    return this._metadata.ctor;
  }

  parse<T>(value: any): T {
    return this._metadata.parse ? this._metadata.parse(value) : value as T;
  }

  getSchema(jsonOnly?: boolean): any {
    return cloneObject(this._metadata, jsonOnly);
  }

}

