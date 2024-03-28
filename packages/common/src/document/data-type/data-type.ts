import { RequiredSome, StrictOmit, Type } from 'ts-gems';
import { OnFailFunction, Validator } from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import type { DataTypeBase } from '../../schema/data-type/data-type.interface.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiNode } from '../api-node';
import { TYPENAME_PATTERN } from '../constants.js';
import {
  colorFgMagenta,
  colorFgYellow,
  colorReset,
  nodeInspectCustom
} from '../utils/inspect.util.js';
import { ApiField } from './field.js';

/**
 * @class DataType
 * @abstract
 */
export abstract class DataType {
  readonly documentNode: ApiNode;
  readonly kind: OpraSchema.DataType.Kind;
  readonly name?: string;
  readonly base?: DataType;
  readonly own: DataType.OwnProperties;
  readonly isEmbedded?: boolean;
  description?: string;

  protected constructor(documentNode: ApiNode, init?: DataType.InitArguments) {
    if (init?.name && !TYPENAME_PATTERN.test(init.name))
      throw new TypeError(`"${init.name}" is not a valid type name`);
    this.base = typeof init?.base === 'string' ? documentNode.getDataType(init.base) : init?.base;
    this.own = {
      embedded: init?.embedded
    };
    this.documentNode = documentNode;
    this.name = init?.name;
    this.description = init?.description;
    this.isEmbedded = init?.embedded || !this.name;
  }

  abstract generateCodec(codec: 'decode' | 'encode', options?: DataType.GenerateCodecOptions): Validator;

  toJSON(): OpraSchema.DataType {
    return omitUndefined({
      kind: this.kind,
      description: this.description,
      base: this.base?.isEmbedded ? this.base.toJSON() : this.base?.name,
    }) as OpraSchema.DataType;
  }

  extendsFrom(type: string | Type | DataType): any {
    const dataType = type instanceof DataType ? type : this.documentNode.findDataType(type);
    let t: DataType | undefined = this;
    while (t) {
      if (t === dataType)
        return true;
      t = t.base;
    }
    return false;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name || '#Embedded'}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}

export namespace DataType {

  export interface InitArguments extends Pick<DataTypeBase, 'description' | 'example'> {
    base?: DataType | string;
    name?: string;
    embedded?: boolean;
  }

  export interface DecoratorOptions extends InitArguments {
  }

  export interface Metadata extends RequiredSome<DecoratorOptions, 'name'> {
    kind: OpraSchema.DataType.Kind;
  }

  export interface OwnProperties {
    embedded?: boolean;
  }

  export type GenerateCodecField = StrictOmit<ApiField.InitArguments, 'type' | 'name'> & {
    type?: DataType | string;
  }

  export type OverrideFieldsConfig = GenerateCodecField & {
    overrideFields?: Record<string, OverrideFieldsConfig>
  };

  export interface GenerateCodecOptions {
    caseInSensitive?: boolean;
    pick?: string[] | readonly string[];
    omit?: string[] | readonly string[];
    partial?: boolean;
    operation?: 'read' | 'write';
    overwriteFields?: Record<string, OverrideFieldsConfig>;
    designType?: Type;
    onFail?: OnFailFunction;
  }


}
