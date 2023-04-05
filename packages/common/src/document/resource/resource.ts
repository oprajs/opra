import { StrictOmit, Type, Writable } from 'ts-gems';
import { omitUndefined } from '../../helpers/object-utils.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';

export namespace Resource {
  export interface InitArguments extends StrictOmit<OpraSchema.ResourceBase, 'kind'> {
    name: string;
    controller?: object | Type;
  }

  export interface DecoratorOptions extends Partial<Pick<InitArguments, 'name' | 'description'>> {

  }
}

export interface Resource {
  readonly document: ApiDocument;
  readonly kind: OpraSchema.Resource.Kind;
  readonly name: string;
  readonly description?: string;
  readonly controller?: object | Type;

  exportSchema(): OpraSchema.ResourceBase;

  toString(): string;

  [nodeInspectCustom](): string;

  _construct(init: Resource.InitArguments): void;
}

export interface ResourceConstructor {
  readonly prototype: Resource;

  new(document: ApiDocument, init: Resource.InitArguments): Resource;

  (...args: any[]): void;
}

export const Resource = function (
    this: Resource | void,
    document: ApiDocument,
    init: Resource.InitArguments
) {
  if (!(this instanceof Resource)) {
    throw new TypeError(`Class constructor must be called with "new" keyword`);
    // noinspection UnreachableCodeJS
    return;
  }
  const _this = this as Writable<Resource>;
  _this.document = document;
  _this.name = init.name;
  _this.description = init.description;
  _this.controller = init.controller;
  _this._construct(init);
} as ResourceConstructor;

const proto = {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _construct(init: Resource.InitArguments): void {
    // Do nothing
  },

  exportSchema(): OpraSchema.ResourceBase {
    return omitUndefined({
      kind: this.kind,
      description: this.description
    })
  },

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name || '#anonymous'}]`;
  },

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }
} as Resource;

Object.assign(Resource.prototype, proto);
