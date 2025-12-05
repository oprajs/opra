import type { Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { DATATYPE_METADATA, kDataTypeMap, kTypeNSMap } from '../constants.js';
import type { ArrayType } from '../data-type/array-type.js';
import type { ComplexType } from '../data-type/complex-type.js';
import type { DataType } from '../data-type/data-type.js';
import type { EnumType } from '../data-type/enum-type.js';
import type { MappedType } from '../data-type/mapped-type.js';
import type { MixinType } from '../data-type/mixin-type.js';
import type { SimpleType } from '../data-type/simple-type.js';
import type { UnionType } from '../data-type/union-type.js';
import type { DataTypeMap } from './data-type-map.js';
import type { DocumentElement } from './document-element.js';

/**
 * @class DocumentNode
 */
export class DocumentNode {
  protected [kDataTypeMap]?: DataTypeMap;
  protected _document?: ApiDocument;
  readonly parent?: DocumentNode;
  readonly element: DocumentElement;

  constructor(element: DocumentElement, parent?: DocumentNode) {
    this.element = element;
    this.parent = parent;
  }

  getDocument(): ApiDocument {
    if (this._document) return this._document;
    if (this.element[kTypeNSMap]) return this.element as unknown as ApiDocument;
    if (this.parent) return (this._document = this.parent.getDocument());
    // istanbul ignore next
    throw new Error('ApiDocument not found in document tree');
  }

  hasDataType(
    nameOrCtor: string | Type | Function | object | any[],
    scope?: string | '*',
  ): boolean {
    return !!this.findDataType(nameOrCtor, scope);
  }

  findDataType(
    nameOrCtor: string | Type | Function | object | any[],
    scope?: string | '*',
  ): DataType | undefined {
    const dt = this[kDataTypeMap]?.get(nameOrCtor);
    if (dt && dt.inScope(scope)) return dt;
    return this.parent
      ? this.parent.findDataType(nameOrCtor, scope)
      : undefined;
  }

  /**
   * Returns DataType instance by name or Constructor. Returns undefined if not found
   */
  getDataType(
    nameOrCtor: string | Type | Function | object | any[],
    scope?: string | '*',
  ): DataType {
    const dt = this.findDataType(nameOrCtor, scope);
    if (dt) return dt;
    let name = '';
    if (typeof nameOrCtor === 'function') {
      const metadata = Reflect.getMetadata(DATATYPE_METADATA, nameOrCtor);
      name = metadata.name;
    } else if (typeof nameOrCtor === 'object') {
      const metadata = nameOrCtor[DATATYPE_METADATA];
      name = metadata?.name;
    }
    if (!name) {
      if (nameOrCtor && typeof nameOrCtor === 'string') name = nameOrCtor;
      else if (typeof nameOrCtor === 'function') name = nameOrCtor.name;
    }
    if (dt)
      throw new TypeError(
        `Data type${name ? ' (' + name + ')' : ''} is not in requested scope (${scope})`,
      );
    throw new TypeError(`Unknown data type${name ? ' (' + name + ')' : ''}`);
  }

  getDataTypeNameWithNs(dataType: DataType): string | undefined {
    if (!dataType.name) return;
    const ns = this.getDocument().getDataTypeNs(dataType);
    return ns ? ns + ':' + dataType.name : dataType.name;
  }

  /**
   * Returns EnumType instance by name or Constructor.
   * Returns undefined if not found
   * Throws error if data type is not a UnionType
   */
  getArrayType(
    nameOrCtor: string | object | any[],
    scope?: string | '*',
  ): ArrayType {
    const t = this.getDataType(nameOrCtor, scope);
    if (t.kind === OpraSchema.ArrayType.Kind) return t as ArrayType;
    throw new TypeError(`Data type "${t.name || t}" is not a MixinType`);
  }

  /**
   * Returns ComplexType instance by name or Constructor.
   * Returns undefined if not found
   * Throws error if data type is not a ComplexType
   */
  getComplexType(
    nameOrCtor: string | Type | Function,
    scope?: string | '*',
  ): ComplexType {
    const t = this.getDataType(nameOrCtor, scope);
    if (t.kind === OpraSchema.ComplexType.Kind) return t as ComplexType;
    throw new TypeError(`Data type "${t.name}" is not a ComplexType`);
  }

  /**
   * Returns SimpleType instance by name or Constructor.
   * Returns undefined if not found
   * Throws error if data type is not a SimpleType
   */
  getSimpleType(nameOrCtor: string | Type, scope?: string | '*'): SimpleType {
    const t = this.getDataType(nameOrCtor, scope);
    if (t.kind === OpraSchema.SimpleType.Kind) return t as SimpleType;
    throw new TypeError(`Data type "${t.name || t}" is not a SimpleType`);
  }

  /**
   * Returns EnumType instance by name or Constructor.
   * Returns undefined if not found
   * Throws error if data type is not a EnumType
   */
  getEnumType(
    nameOrCtor: string | object | any[],
    scope?: string | '*',
  ): EnumType {
    const t = this.getDataType(nameOrCtor, scope);
    if (t.kind === OpraSchema.EnumType.Kind) return t as EnumType;
    throw new TypeError(`Data type "${t.name || t}" is not a EnumType`);
  }

  /**
   * Returns EnumType instance by name or Constructor.
   * Returns undefined if not found
   * Throws error if data type is not a MappedType
   */
  getMappedType(
    nameOrCtor: string | object | any[],
    scope?: string | '*',
  ): MappedType {
    const t = this.getDataType(nameOrCtor, scope);
    if (t.kind === OpraSchema.MappedType.Kind) return t as MappedType;
    throw new TypeError(`Data type "${t.name || t}" is not a MappedType`);
  }

  /**
   * Returns EnumType instance by name or Constructor.
   * Returns undefined if not found
   * Throws error if data type is not a MixinType
   */
  getMixinType(
    nameOrCtor: string | object | any[],
    scope?: string | '*',
  ): MixinType {
    const t = this.getDataType(nameOrCtor, scope);
    if (t.kind === OpraSchema.MixinType.Kind) return t as MixinType;
    throw new TypeError(`Data type "${t.name || t}" is not a MixinType`);
  }

  /**
   * Returns EnumType instance by name or Constructor.
   * Returns undefined if not found
   * Throws error if data type is not a UnionType
   */
  getUnionType(
    nameOrCtor: string | object | any[],
    scope?: string | '*',
  ): UnionType {
    const t = this.getDataType(nameOrCtor, scope);
    if (t.kind === OpraSchema.UnionType.Kind) return t as UnionType;
    throw new TypeError(`Data type "${t.name || t}" is not a UnionType`);
  }
}
