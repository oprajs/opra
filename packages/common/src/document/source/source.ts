import { StrictOmit, Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { omitUndefined } from '../../helpers/object-utils.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';
import { Action } from './action.js';
import { METADATA_KEY } from '../constants.js';
import { Collection } from './collection.js';

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
  abstract readonly operations: Record<string, any>;
  readonly actions = new ResponsiveMap<Action>();

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
    const schema = omitUndefined<OpraSchema.SourceBase>({
      kind: this.kind,
      description: this.description,
    });
    if (this.actions.size) {
      const actions = schema.actions = {};
      for (const [name, r] of this.actions.entries()) {
        actions[name] = r.exportSchema();
      }
    }
    return schema;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name || '#anonymous'}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }
}

