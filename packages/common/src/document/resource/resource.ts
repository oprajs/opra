import { StrictOmit, Type } from 'ts-gems';
import { omitUndefined } from '../../helpers/object-utils.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';
import { Action } from './action.js';

export namespace Resource {
  export interface InitArguments extends StrictOmit<OpraSchema.ResourceBase, 'kind'> {
    name: string;
    controller?: object | Type;
  }

  export interface DecoratorOptions extends Partial<Pick<InitArguments, 'name' | 'description'>> {
  }

  export interface Metadata extends OpraSchema.ResourceBase {
    name: string;
  }

  export interface ActionOptions {

  }

}

export abstract class Resource {
  readonly document: ApiDocument;
  abstract readonly kind: OpraSchema.Resource.Kind;
  readonly name: string;
  readonly description?: string;
  readonly controller?: object | Type;
  abstract readonly operations: Record<string, any>;
  readonly actions: Record<string, Action> = {};

  protected constructor(
      document: ApiDocument,
      init: Resource.InitArguments
  ) {
    this.document = document;
    this.name = init.name;
    this.description = init.description;
    this.controller = init.controller;
    if (init.actions) {
      for (const [name, meta] of Object.entries(init.actions)) {
        this.actions[name.toLowerCase()] = new Action({...meta, name});
      }
    }
  }

  exportSchema(): OpraSchema.ResourceBase {
    const schema = omitUndefined<OpraSchema.ResourceBase>({
      kind: this.kind,
      description: this.description,
    });
    const actions = {};
    let i = 0;
    for (const action of Object.values(this.actions)) {
      actions[action.name] = action.exportSchema();
      i++;
    }
    if (i)
      schema.actions = actions;
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

