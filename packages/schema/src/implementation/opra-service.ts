import { StrictOmit } from 'ts-gems';
import { ResponsiveMap } from '../helpers/responsive-map.js';
import { OpraSchema } from '../interfaces/opra-schema.interface.js';
import { IResourceContainer } from '../interfaces/resource-container.interface.js';
import { stringCompare } from '../utils/string-compare.util.js';
import { EntityType } from './data-type/entity-type.js';
import { OpraDocument } from './opra-document.js';
import { BaseResource } from './resource/base-resource.js';
import { EntityResource } from './resource/entity-resource.js';
import { SchemaGenerator } from './schema-generator.js';

export type OpraServiceArgs = StrictOmit<OpraSchema.Service, 'version' | 'types' | 'resources'>;

export class OpraService extends OpraDocument implements IResourceContainer {
  protected declare readonly _args: OpraServiceArgs;
  protected _resources = new ResponsiveMap<string, BaseResource>();

  constructor(schema: OpraSchema.Service) {
    super(schema);
    if (schema.resources)
      this._addResources(schema.resources);
  }

  get resources(): Map<string, BaseResource> {
    return this._resources;
  }

  get servers(): OpraSchema.ServerInfo[] | undefined {
    return this._args.servers;
  }

  getResource<T extends BaseResource>(name: string): T {
    const t = this.resources.get(name);
    if (!t)
      throw new Error(`Resource "${name}" does not exists`);
    return t as T;
  }

  getEntityResource(name: string): EntityResource {
    const t = this.getResource(name);
    if (!(t instanceof EntityResource))
      throw new Error(`"${name}" is not an EntityResource`);
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
      if (OpraSchema.isEntityResource(r)) {
        const dataType = this.getDataType(r.type);
        if (!dataType)
          throw new TypeError(`Datatype "${r.type}" declared in EntityResource (${r.name}) does not exists`);
        if (!(dataType instanceof EntityType))
          throw new TypeError(`${r.type} is not an EntityType`);
        this.resources.set(r.name, new EntityResource(this, dataType, r));
      } else
        throw new TypeError(`Unknown resource kind (${r.kind})`);
    }
  }

  static async create(args: SchemaGenerator.GenerateServiceArgs): Promise<OpraService> {
    const schema = await SchemaGenerator.generateServiceSchema(args);
    return new OpraService(schema);
  }

}
