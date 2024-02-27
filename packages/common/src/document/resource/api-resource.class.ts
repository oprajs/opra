import { Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { omitUndefined } from '../../helpers/object-utils.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';
import { ApiAction } from './api-action.js';
import { ApiElement } from './api-element.js';
import { ApiKeyParameter } from './api-key-parameter.js';
import { ApiOperation } from './api-operation.js';
import type { ApiResource } from './api-resource.js';

const PATH_PREFIX_PATTERN = /^(\/*)(.+)$/;
const NAME_PATTERN = /^\w+@?$/i;

export class ApiResourceClass extends ApiElement {
  readonly kind: OpraSchema.Resource.Kind;
  readonly name: string;
  description?: string;
  resources = new ResponsiveMap<ApiResource>();
  endpoints = new ResponsiveMap<ApiAction | ApiOperation>();
  keyParameter?: ApiKeyParameter;
  controller?: object;
  ctor?: Type;

  constructor(
      parent: ApiDocument | ApiResourceClass,
      name: string,
      init: ApiResource.InitArguments
  ) {
    super(parent);
    if (!NAME_PATTERN.test(name))
      throw new TypeError(`Invalid resource name (${name})`);
    if (init.keyParameter && !name.endsWith('@'))
      throw new Error(`Name of resources with keys should end with @ character. (${name})`);
    this.name = name;

    this.kind = OpraSchema.Resource.Kind;
    this.description = init.description;
    this.controller = init.controller;
    if (this.controller) {
      this.ctor = Object.getPrototypeOf(this.controller).constructor;
    } else this.ctor = init.ctor;
    if (init.keyParameter)
      this.keyParameter = new ApiKeyParameter(this, init.keyParameter);
    if (init.endpoints) {
      for (const [endpointName, endpointMeta] of Object.entries(init.endpoints)) {
        if (endpointMeta.kind === OpraSchema.Action.Kind)
          this.addAction(endpointName, endpointMeta);
        else
          this.addOperation(endpointName, endpointMeta);
      }
    }
    if (init.resources) {
      for (const [resourceName, resourceMeta] of Object.entries(init.resources))
        this.addResource(resourceName, resourceMeta);
    }
  }

  addAction(name: string, init: ApiAction.InitArguments): ApiAction {
    if (this.endpoints.has(name))
      throw new Error(`Duplicate endpoint error (${this.name}.${this.name})`);
    const endpoint = new ApiAction(this, name, init);
    this.endpoints.set(name, endpoint);
    return endpoint;
  }

  addOperation(name: string, init: ApiOperation.InitArguments): ApiOperation {
    if (this.endpoints.has(name))
      throw new Error(`Duplicate endpoint error (${this.name}.${this.name})`);
    const endpoint = new ApiOperation(this, name, init);
    this.endpoints.set(endpoint.name, endpoint);
    return endpoint;
  }

  addResource(name: string, init: ApiResource.InitArguments): ApiResource {
    if (this.endpoints.has(name))
      throw new Error(`Duplicate resource error (${this.getFullPath()}/${this.name})`);
    const resource = new ApiResourceClass(this, name, init);
    this.resources.set(resource.name, resource);
    return resource;
  }

  exportSchema(): OpraSchema.Resource {
    const schema = omitUndefined<OpraSchema.Resource>({
      kind: this.kind,
      description: this.description,
      keyParameter: this.keyParameter?.exportSchema()
    });
    if (this.endpoints.size) {
      schema.endpoints = {};
      for (const endpoint of this.endpoints.values()) {
        schema.endpoints[endpoint.name] = endpoint.exportSchema();
      }
    }
    if (this.resources.size) {
      schema.resources = {};
      for (const resource of this.resources.values()) {
        schema.resources[resource.name] = resource.exportSchema();
      }
    }
    return schema;
  }

  get isRoot(): boolean {
    return !(this.parent instanceof ApiResourceClass);
  }

  getFullPath(documentPath?: boolean): string {
    const isRoot = !(this.parent instanceof ApiResourceClass);
    let out = isRoot ? '/' : this.parent?.getFullPath(documentPath);
    if (!out?.endsWith('/'))
      out += '/';
    return out + (isRoot && documentPath ? 'resources/' : '') + (isRoot ? '' : this.name);
  }

  getAction(name: string): ApiAction | undefined {
    const endpoint = this.endpoints.get(name);
    return endpoint && endpoint instanceof ApiAction ? endpoint : undefined;
  }

  getOperation(name: string): ApiOperation | undefined {
    const endpoint = this.endpoints.get(name);
    return endpoint && endpoint instanceof ApiOperation ? endpoint : undefined;
  }

  /**
   * Returns Resource instance by path. Returns undefined if not found
   * @param path
   */
  getResource(path: string): ApiResource | undefined {
    let resource: ApiResource | undefined;
    path = PATH_PREFIX_PATTERN.exec(path)?.[2] || path;
    if (path.includes('/')) {
      const arr = path.split('/');
      let i: number;
      const l = arr.length;
      resource = this;
      for (i = 0; i < l; i++) {
        resource = resource.resources.get(arr[i]);
        if (!resource)
          break;
      }
    } else
      resource = this.resources.get(path);
    return resource;
  }


  toString(): string {
    return `[ApiResource ${this.name}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow}ApiResource${colorFgMagenta + this.name + colorReset}]`;
  }
}

