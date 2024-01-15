import { StrictOmit, Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { omitUndefined } from '../../helpers/object-utils.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';
import { Action } from './action.js';
import type { Container } from './container.js';
import { CrudOperation } from './crud-operation.js';
import type { ResourceDecorator } from './resource-decorator';

export abstract class Resource {
  readonly document: ApiDocument;
  readonly parent?: Container;
  abstract readonly kind: OpraSchema.Resource.Kind;
  readonly name: string;
  description?: string;
  controller?: object;
  ctor?: Type;
  actions = new ResponsiveMap<Action>();

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
    if (init.actions) {
      for (const [name, meta] of Object.entries(init.actions)) {
        this.actions.set(name, new Action(this, name, meta));
      }
    }
  }

  getFullPath(documentPath?: boolean): string {
    if ((this as any) === this.document.root)
      return documentPath ? '/root' : '/';
    let out = this.parent?.getFullPath(documentPath);
    if (!out?.endsWith('/'))
      out += '/';
    return out + (documentPath ? 'resources/' : '') + this.name;
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.ResourceBase {
    const schema = omitUndefined<OpraSchema.ResourceBase>({
      kind: this.kind,
      description: this.description,
    });
    if (this.actions.size) {
      schema.actions = {};
      for (const action of this.actions.values()) {
        schema.actions[action.name] = action.exportSchema(options);
      }
    }
    return schema;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name || '#Embedded'}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }
}

export namespace Resource {
  export interface InitArguments extends StrictOmit<ResourceDecorator.Metadata, 'kind' | 'operations' | 'actions'> {
    name: string;
    actions?: Record<string, Action.InitArguments>;
    operations?: Record<string, CrudOperation.InitArguments>;
    controller?: object;
    ctor?: Type;
  }

}
