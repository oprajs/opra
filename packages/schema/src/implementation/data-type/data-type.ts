import { Type } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';
import { cloneObject } from '../../utils/clone-object.util.js';
import { OpraDocument } from '../opra-document.js';
import { builtinClassMap, internalDataTypes, primitiveDataTypeNames } from './internal-data-types.js';

export abstract class DataType {
  protected _owner: OpraDocument;
  protected readonly _metadata: OpraSchema.BaseDataType;

  protected constructor(owner: OpraDocument, metadata: OpraSchema.DataType) {
    this._owner = owner;
    this._metadata = metadata;
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

  parse<T>(value: any): T {
    return this._metadata.parse ? this._metadata.parse(value) : value as T;
  }

  getSchema(jsonOnly?: boolean): any {
    return cloneObject(this._metadata, jsonOnly);
  }

  static isInternalType(t: string | Type): boolean {
    if (typeof t === 'string')
      return internalDataTypes.has(t.toLowerCase());
    return builtinClassMap.has(t);
  }

  static isPrimitiveType(t: string | Type): boolean {
    if (typeof t === 'function') {
      const s = builtinClassMap.get(t);
      return s ? primitiveDataTypeNames.includes(s.name) : false;
    }
    return typeof t === 'string' ? primitiveDataTypeNames.includes(t.toLowerCase()) : false;
  }

}

