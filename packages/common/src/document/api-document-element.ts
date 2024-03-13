import { Type } from 'ts-gems';
import { ResponsiveMap } from '../helpers/index.js';
import { OpraSchema } from '../schema/index.js';
import { ApiNode } from './api-node.js';
import type { ComplexType } from './data-type/complex-type.js';
import type { DataType } from './data-type/data-type.js';
import type { EnumType } from './data-type/enum-type.js';

export abstract class ApiDocumentElement extends ApiNode {
  protected _ctorTypeMap = new WeakMap<Type | object, string>();
  readonly parent?: ApiNode;
  types = new ResponsiveMap<DataType>();

  /**
   * Returns DataType instance by name or Constructor. Returns undefined if not found
   * @param nameOrCtor
   */
  findDataType(nameOrCtor: string | Type | Function | object): DataType | undefined {
    let result: DataType | undefined;
    const name = typeof nameOrCtor === 'string' ? nameOrCtor : this._ctorTypeMap.get(nameOrCtor);

    if (name) {
      result = this.types.get(name);
      if (result)
        return result;
    }

    if (typeof nameOrCtor !== 'string') {
      for (const [k, dt] of this.types.entries()) {
        if (
            (dt.kind === OpraSchema.ComplexType.Kind && (dt as ComplexType).isTypeOf(nameOrCtor as any)) ||
            (dt.kind === OpraSchema.EnumType.Kind && (dt as EnumType).isTypeOf(nameOrCtor as any))
        ) {
          result = dt;
          this._ctorTypeMap.set(nameOrCtor, k);
          return result;
        }
      }
    }
    if (this.parent)
      return this.parent.findDataType(nameOrCtor);
  }

  registerTypeCtor(ctor: Function | Type, typeName: string) {
    this._ctorTypeMap.set(ctor, typeName);
  }

  toJSON(): OpraSchema.DocumentElement {
    const schema: OpraSchema.DocumentElement = {};
    if (this.types.size) {
      const types = schema.types = {};
      for (const [name, r] of this.types.entries()) {
        types[name] = r.toJSON();
      }
    }
    return schema;
  }

}
