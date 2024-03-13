import { RequiredSome, StrictOmit, Type } from 'ts-gems';
import { OnFailFunction, Validator } from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
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
  description?: string;
  isEmbedded?: boolean;

  protected constructor(documentNode: ApiNode, init?: DataType.InitArguments) {
    if (init?.name && !TYPENAME_PATTERN.test(init.name))
      throw new TypeError(`"${init.name}" is not a valid type name`);
    this.documentNode = documentNode;
    this.name = init?.name;
    this.own = {};
    this.description = init?.description;
    if (!this.name)
      this.isEmbedded = true;
  }

  abstract generateCodec(codec: 'decode' | 'encode', options?: DataType.GenerateCodecOptions): Validator;

  toJSON(): OpraSchema.DataType {
    return omitUndefined({
      kind: this.kind,
      description: this.description
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

  export interface InitArguments {
    name?: string;
    description?: string;
    example?: string | string[];
  }

  export interface DecoratorOptions extends InitArguments {
  }

  export interface Metadata extends RequiredSome<DecoratorOptions, 'name'> {
    kind: OpraSchema.DataType.Kind;
  }

  export interface OwnProperties {
  }

  export type GenerateCodecField = StrictOmit<ApiField.InitArguments, 'type' | 'name'> & {
    type?: DataType | string;
  }

  export type OverrideFieldsConfig = GenerateCodecField & {
    overrideFields?: Record<string, OverrideFieldsConfig>
  };

  export interface GenerateCodecOptions {
    caseSensitive?: boolean;
    pick?: string[] | readonly string[];
    omit?: string[] | readonly string[];
    partial?: boolean;
    operation?: 'read' | 'write';
    overwriteFields?: Record<string, OverrideFieldsConfig>;
    designType?: Type;
    onFail?: OnFailFunction;
  }


}
