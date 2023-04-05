import { Type, Writable } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';

export namespace DataType {
  export interface InitArguments extends Partial<Pick<OpraSchema.DataTypeBase, 'description'>> {
    name?: string;
  }

  export interface OwnProperties {
    description?: string;
  }

  export interface DecoratorOptions extends Pick<InitArguments, 'name' | 'description'> {

  }
}

export interface DataType extends DataType.OwnProperties {
  readonly document: ApiDocument;
  readonly kind: OpraSchema.DataType.Kind;
  readonly name?: string;
  readonly own: DataType.OwnProperties;
  readonly isAnonymous: boolean;

  coerce(value: any): any;

  validate(v: any): void;

  extendsFrom(t: string | Type | DataType): boolean;

  exportSchema(): OpraSchema.DataType;

  toString(): string;

  [nodeInspectCustom](): string;
}

export interface DataTypeConstructor {
  new(document: ApiDocument, init?: DataType.InitArguments): DataType;

  (...args: any[]): void;

  prototype: DataType;
}

export const DataType = function (
    this: DataType | void,
    document: ApiDocument,
    init?: DataType.InitArguments
) {
  if (!(this instanceof DataType)) {
    throw new TypeError(`Class constructor must be called with "new" keyword`);
    // noinspection UnreachableCodeJS
    return;
  }
  const _this = this as Writable<DataType>;
  _this.document = document;
  _this.name = init?.name;
  _this.own = {
    description: init?.description
  };
  _this.description = init?.description;
  return this;
} as DataTypeConstructor;

const proto = {
  get isAnonymous(): boolean {
    return !this.name;
  },

  coerce(value: any): any {
    return value;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  extendsFrom(t: string | Type | DataType): boolean {
    return false;
  },

  exportSchema(): OpraSchema.DataType {
    return omitUndefined({
      kind: this.kind,
      description: this.own.description
    });
  },

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name || '#anonymous'}]`;
  },

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }
} as DataType;

Object.assign(DataType.prototype, proto);
