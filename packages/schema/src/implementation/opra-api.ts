import { StrictOmit } from 'ts-gems';
import { ResponsiveMap } from '../helpers/responsive-map.js';
import { IResource } from '../interfaces/resource.interface.js';
import { IResourceContainer } from '../interfaces/resource-container.interface.js';
import { OpraSchema } from '../opra-schema.js';
import { stringCompare } from '../utils/string-compare.util.js';
import { ComplexType } from './data-type/complex-type.js';
import { OpraDocument } from './opra-document.js';
import { OpraResource } from './resource/base-resource.js';
import { CollectionResource } from './resource/collection-resource.js';
import { SchemaGenerator } from './schema-generator.js';

export type OpraServiceArgs = StrictOmit<OpraSchema.Service, 'version' | 'types' | 'resources'>;

export class OpraApi extends OpraDocument implements IResourceContainer {
  protected declare readonly _args: OpraServiceArgs;
  protected _resources = new ResponsiveMap<string, OpraResource>();

  constructor(schema: OpraSchema.Service) {
    super(schema);
    if (schema.resources)
      this._addResources(schema.resources);
  }

  get resources(): Map<string, OpraResource> {
    return this._resources;
  }

  get servers(): OpraSchema.ServerInfo[] | undefined {
    return this._args.servers;
  }

  getResource<T extends OpraResource>(name: string): T {
    const t = this.resources.get(name);
    if (!t)
      throw new Error(`Resource "${name}" does not exists`);
    return t as T;
  }

  getCollectionResource(name: string): CollectionResource {
    const t = this.getResource(name);
    if (!(t instanceof CollectionResource))
      throw new Error(`"${name}" is not a Collection Resource`);
    return t;
  }

  getSchema(jsonOnly?: boolean) {
    const out: OpraSchema.Service = {
      ...super.getSchema(jsonOnly),
      resources: []
    };
    const sortedResourcesArray = Array.from(this.resources.values())
        .sort((a, b) => stringCompare(a.name, b.name));
    for (const resource of sortedResourcesArray) {
      out.resources.push(resource.getSchema(jsonOnly));
    }
    return out;
  }

  protected _addResources(resources: OpraSchema.Resource[]): void {
    for (const r of resources) {
      if (OpraSchema.isCollectionResource(r)) {
        const dataType = this.getDataType(r.type);
        if (!dataType)
          throw new TypeError(`Datatype "${r.type}" declared in CollectionResource (${r.name}) does not exists`);
        if (!(dataType instanceof ComplexType))
          throw new TypeError(`${r.type} is not an ComplexType`);
        this.resources.set(r.name, new CollectionResource(this, dataType, r));
      } else
        throw new TypeError(`Unknown resource kind (${r.kind})`);
    }
  }

  static async create(args: SchemaGenerator.GenerateServiceArgs): Promise<OpraApi> {
    const schema = await SchemaGenerator.generateServiceSchema(args);
    const service = new OpraApi(schema);
    for (const r of service.resources.values()) {
      if (r.instance) {
        const init = (r.instance as IResource).init;
        if (init)
          await init.call(r.instance, r);
      }
    }
    return service;
  }
}


