import { StrictOmit, Type } from 'ts-gems';
import { omitUndefined } from '../../helpers/object-utils.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';

export namespace Source {
  export interface InitArguments extends StrictOmit<OpraSchema.SourceBase, 'kind'> {
    name: string;
    controller?: object | Type;
  }

  export interface DecoratorOptions extends Partial<Pick<InitArguments, 'name' | 'description'>> {

  }
}

export abstract class Source {
  readonly document: ApiDocument;
  abstract readonly kind: OpraSchema.Source.Kind;
  readonly name: string;
  readonly description?: string;
  readonly controller?: object | Type;
  abstract readonly endpoints: Record<string, any>;

  protected constructor(
      document: ApiDocument,
      init: Source.InitArguments
  ) {
    this.document = document;
    this.name = init.name;
    this.description = init.description;
    this.controller = init.controller;
  }

  exportSchema(): OpraSchema.SourceBase {
    return omitUndefined({
      kind: this.kind,
      description: this.description
    })
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name || '#anonymous'}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }
}
