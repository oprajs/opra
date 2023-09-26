import { StrictOmit, Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { omitUndefined } from '../../helpers/object-utils.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';
import type { Container } from './container.js';
import { Endpoint } from './endpoint.js';
import type { ResourceDecorator } from './resource-decorator';

export abstract class Resource {
  readonly document: ApiDocument;
  readonly parent?: Container;
  abstract readonly kind: OpraSchema.Resource.Kind;
  readonly name: string;
  description?: string;
  controller?: object;
  ctor?: Type;
  operations = new ResponsiveMap<Endpoint>();
  actions = new ResponsiveMap<Endpoint>();

  protected constructor(
      parent: ApiDocument | Container,
      init: Resource.InitArguments
  ) {
    if (parent instanceof Resource) {
      this.document = parent.document;
      this.parent = parent;
    } else
      this.document = parent;
    this.name = init.name;
    this.description = init.description;
    this.controller = init.controller;
    if (this.controller) {
      this.ctor = Object.getPrototypeOf(this.controller).constructor;
    } else this.ctor = init.ctor;
    if (init.operations) {
      for (const [name, meta] of Object.entries(init.operations)) {
        this.operations.set(name, new Endpoint(this, name, meta));
      }
    }
    if (init.actions) {
      for (const [name, meta] of Object.entries(init.actions)) {
        this.actions.set(name, new Endpoint(this, name, meta));
      }
    }
  }

  getFullPath(): string {
    if (this.parent && this.parent.name)
      return this.parent?.getFullPath() + '/' + this.name;
    return this.name;
  }

  getOperation(name: string): Endpoint | undefined {
    return this.operations.get(name);
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.ResourceBase {
    const schema = omitUndefined<OpraSchema.ResourceBase>({
      kind: this.kind,
      description: this.description,
    });
    if (this.operations.size) {
      schema.operations = {};
      for (const operation of this.operations.values()) {
        schema.operations[operation.name] = operation.exportSchema(options);
      }
    }
    if (this.actions.size) {
      schema.actions = {};
      for (const action of this.actions.values()) {
        schema.actions[action.name] = action.exportSchema(options);
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

export namespace Resource {
  export interface InitArguments extends StrictOmit<ResourceDecorator.Metadata, 'kind' | 'operations' | 'actions'> {
    name: string;
    actions?: Record<string, Endpoint.InitArguments>;
    operations?: Record<string, Endpoint.InitArguments>;
    controller?: object;
    ctor?: Type;
  }

}
