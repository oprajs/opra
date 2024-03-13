import { Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { omitUndefined } from '../../helpers/object-utils.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { ApiDocumentElement } from '../api-document-element.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';
import { HttpAction } from './http-action.js';
import { HttpKeyParameter } from './http-key-parameter.js';
import { HttpOperation } from './http-operation.js';
import type { HttpResource } from './http-resource';

const PATH_PREFIX_PATTERN = /^(\/*)(.+)$/;
const NAME_PATTERN = /^\w+@?$/i;

export class HttpResourceClass extends ApiDocumentElement {
  readonly kind: OpraSchema.Http.Resource.Kind;
  name: string;
  description?: string;
  resources = new ResponsiveMap<HttpResource>();
  endpoints = new ResponsiveMap<HttpAction | HttpOperation>();
  keyParameter?: HttpKeyParameter;
  controller?: object;
  ctor?: Type;

  constructor(
      parent: ApiDocument | HttpResourceClass,
      name: string,
      init: HttpResource.InitArguments
  ) {
    super(parent);
    if (!NAME_PATTERN.test(name))
      throw new TypeError(`Invalid resource name (${name})`);
    // if (init.keyParameter && !name.endsWith('@'))
    //   throw new Error(`Name of resources with keys should end with @ character. (${name})`);
    this.kind = OpraSchema.Http.Resource.Kind;
    this.name = name;
    this.description = init.description;
    this.controller = init.controller;
    if (this.controller) {
      this.ctor = Object.getPrototypeOf(this.controller).constructor;
    } else this.ctor = init.ctor;
    this._initialize(init);
  }

  setKeyParameter(keyParameter: HttpKeyParameter.InitArguments | undefined) {
    if (keyParameter) {
      this.keyParameter = new HttpKeyParameter(this, keyParameter);
      if (!this.name.endsWith('@'))
        this.name += '@';
    } else {
      this.keyParameter = undefined;
      this.name = this.name.replace('@', '');
    }
  }

  addAction(name: string, init: HttpAction.InitArguments): HttpAction {
    if (this.endpoints.has(name))
      throw new Error(`Duplicate endpoint error (${this.name}.${this.name})`);
    const endpoint = new HttpAction(this, name, init);
    this.endpoints.set(name, endpoint);
    return endpoint;
  }

  addOperation(name: string, init: HttpOperation.InitArguments): HttpOperation {
    if (this.endpoints.has(name))
      throw new Error(`Duplicate endpoint error (${this.name}.${this.name})`);
    const endpoint = new HttpOperation(this, name, init);
    this.endpoints.set(endpoint.name, endpoint);
    return endpoint;
  }

  addResource(name: string, init: HttpResource.InitArguments): HttpResource {
    if (this.endpoints.has(name))
      throw new Error(`Duplicate resource error (${this.getFullPath()}/${this.name})`);
    const resource = new HttpResourceClass(this, name, init);
    this.resources.set(resource.name, resource);
    return resource;
  }

  toJSON(): OpraSchema.Http.Resource {
    const schema = omitUndefined<OpraSchema.Http.Resource>({
      kind: this.kind,
      description: this.description,
      keyParameter: this.keyParameter?.toJSON()
    });
    if (this.endpoints.size) {
      schema.endpoints = {};
      for (const endpoint of this.endpoints.values()) {
        schema.endpoints[endpoint.name] = endpoint.toJSON();
      }
    }
    if (this.resources.size) {
      schema.resources = {};
      for (const resource of this.resources.values()) {
        schema.resources[resource.name] = resource.toJSON();
      }
    }
    return schema;
  }

  get isRoot(): boolean {
    return !(this.parent instanceof HttpResourceClass);
  }

  getFullPath(documentPath?: boolean): string {
    const isRoot = !(this.parent instanceof HttpResourceClass);
    let out = isRoot ? '/' : this.parent?.getFullPath(documentPath);
    if (!out?.endsWith('/'))
      out += '/';
    return out + (isRoot && documentPath ? 'resources/' : '') + (isRoot ? '' : this.name);
  }

  getAction(name: string): HttpAction | undefined {
    const endpoint = this.endpoints.get(name);
    return endpoint && endpoint instanceof HttpAction ? endpoint : undefined;
  }

  getOperation(name: string): HttpOperation | undefined {
    const endpoint = this.endpoints.get(name);
    return endpoint && endpoint instanceof HttpOperation ? endpoint : undefined;
  }

  /**
   * Returns Resource instance by path. Returns undefined if not found
   * @param path
   */
  getResource(path: string): HttpResource | undefined {
    let resource: HttpResource | undefined;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected _initialize(init: HttpResource.InitArguments) {
  }

  toString(): string {
    return `[HttpResource ${this.name}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow}HttpResource${colorFgMagenta + this.name + colorReset}]`;
  }
}

