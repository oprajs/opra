import { Type } from 'ts-gems';
import { OpraSchema } from '../schema/index.js';
import { DATATYPE_METADATA } from './constants.js';
import { ComplexType } from './data-type/complex-type.js';
import type { DataType } from './data-type/data-type';
import { EnumType } from './data-type/enum-type.js';
import { SimpleType } from './data-type/simple-type.js';

export abstract class ApiNode {
  readonly parent?: ApiNode;

  protected constructor(parent?: ApiNode) {
    this.parent = parent;
  }

  findDataType(nameOrCtor: string | Type | Function | object): DataType | undefined {
    if (this.parent)
      return this.parent.findDataType(nameOrCtor);
  }

  /**
   * Returns DataType instance by name or Constructor. Returns undefined if not found
   * @param nameOrCtor
   */
  getDataType(nameOrCtor: string | Type | Function | object): DataType {
    const dt = this.findDataType(nameOrCtor);
    if (dt)
      return dt
    let name = '';
    if (typeof nameOrCtor === 'function') {
      const metadata = Reflect.getMetadata(DATATYPE_METADATA, nameOrCtor);
      name = metadata.name;
    } else if (typeof nameOrCtor === 'object') {
      const metadata = nameOrCtor[DATATYPE_METADATA];
      name = metadata.name;
    }
    if (typeof nameOrCtor === 'string')
      name = nameOrCtor;
    throw new TypeError(`Unknown data type` + (name ? ' (' + name + ')' : ''));
  }

  /**
   * Returns ComplexType instance by name or Constructor.
   * Returns undefined if not found
   * Throws error if data type is not a ComplexType
   * @param nameOrCtor
   */
  getComplexType(nameOrCtor: string | Type | Function): ComplexType {
    const t = this.getDataType(nameOrCtor);
    if (t.kind === OpraSchema.ComplexType.Kind)
      return t as ComplexType;
    throw new TypeError(`Data type "${t.name}" is not a ComplexType`);
  }

  /**
   * Returns SimpleType instance by name or Constructor.
   * Returns undefined if not found
   * Throws error if data type is not a SimpleType
   * @param nameOrCtor
   */
  getSimpleType(nameOrCtor: string | Type): SimpleType {
    const t = this.getDataType(nameOrCtor);
    if (t.kind === OpraSchema.SimpleType.Kind)
      return t as SimpleType;
    throw new TypeError(`Data type "${t.name || t}" is not a SimpleType`);
  }

  /**
   * Returns EnumType instance by name or Constructor.
   * Returns undefined if not found
   * Throws error if data type is not a EnumType
   * @param nameOrCtor
   */
  getEnumType(nameOrCtor: string | EnumType.EnumObject | EnumType.EnumArray): EnumType {
    const t = this.getDataType(nameOrCtor);
    if (t.kind === OpraSchema.EnumType.Kind)
      return t as EnumType;
    throw new TypeError(`Data type "${t.name || t}" is not a EnumType`);
  }

}
