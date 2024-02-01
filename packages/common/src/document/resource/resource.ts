import { StrictOmit, Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { omitUndefined } from '../../helpers/object-utils.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';
import { ApiAction } from './api-action.js';
import { ApiElement } from './api-element.js';
import { ApiOperation } from './api-operation.js';
import type { Container } from './container.js';
import type { ResourceDecorator } from './resource-decorator';

export abstract class Resource extends ApiElement {
  readonly parent?: Container;
  abstract readonly kind: OpraSchema.Resource.Kind;
  readonly name: string;
  description?: string;
  controller?: object;
  ctor?: Type;
  actions = new ResponsiveMap<ApiAction>();

  protected constructor(
      parent: ApiDocument | Container,
      init: Resource.InitArguments
  ) {
    super(parent instanceof Resource ? parent.document : parent);
    if (parent instanceof Resource)
      this.parent = parent;
    this.name = init.name;
    this.description = init.description;
    this.controller = init.controller;
    if (this.controller) {
      this.ctor = Object.getPrototypeOf(this.controller).constructor;
    } else this.ctor = init.ctor;
    if (init.actions) {
      for (const [name, meta] of Object.entries(init.actions)) {
        this.actions.set(name, new ApiAction(this, name, meta));
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

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Resource {
    const schema = omitUndefined<OpraSchema.Resource>({
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
  export interface InitArguments extends StrictOmit<ResourceDecorator.DecoratorMetadata, 'kind' | 'operations' | 'actions'> {
    name: string;
    actions?: Record<string, ApiAction.InitArguments>;
    operations?: Record<string, ApiOperation.InitArguments>;
    controller?: object;
    ctor?: Type;
  }

}
