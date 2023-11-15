import { RequiredSome, Type } from 'ts-gems';
import * as vg from 'valgen';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
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
  readonly document: ApiDocument;
  readonly kind: OpraSchema.DataType.Kind;
  readonly name?: string;
  readonly base?: DataType;
  readonly own: DataType.OwnProperties;
  description?: string;
  isAnonymous?: boolean;

  protected constructor(document: ApiDocument, init?: DataType.InitArguments) {
    this.document = document;
    this.name = init?.name;
    this.own = {};
    this.description = init?.description;
    if (!this.name)
      this.isAnonymous = true;
  }

  abstract generateCodec(codec: 'decode' | 'encode', options?: DataType.GenerateCodecOptions): vg.Validator;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exportSchema(options?: { webSafe?: boolean }): OpraSchema.DataType {
    return omitUndefined({
      kind: this.kind,
      description: this.description
    }) as OpraSchema.DataType;
  }

  extendsFrom(type: string | Type | DataType): any {
    const dataType = type instanceof DataType ? type : this.document.getDataType(type);
    let t: DataType | undefined = this;
    while (t) {
      if (t === dataType)
        return true;
      t = t.base;
    }
    return false;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name || '#anonymous'}]`;
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

  export interface GenerateCodecOptions {
    caseSensitive?: boolean;
    pick?: string[];
    omit?: string[];
    partial?: boolean;
    operation?: 'read' | 'write';
    overwriteFields?: ResponsiveMap<ApiField.InitArguments>;
    designType?: Type;
  }

}
