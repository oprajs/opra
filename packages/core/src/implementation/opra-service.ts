import merge from 'putil-merge';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/schema';
import { OpraVersion } from '../constants.js';
import { IResourceContainer } from '../interfaces/resource-container.interface.js';
import { internalDataTypes } from '../utils/internal-data-types.js';
import { Responsive } from '../utils/responsive-object.js';
import { EntityType } from './data-type/entity-type.js';
import { OpraDocument } from './opra-document.js';
import { EntityResourceHandler } from './resource/entity-resource-handler.js';
import { ResourceHandler } from './resource/resource-handler.js';
import { SchemaGenerator } from './schema-generator.js';

export type OpraServiceArgs = StrictOmit<OpraSchema.Service, 'version' | 'types' | 'resources'>;

export class OpraService extends OpraDocument implements IResourceContainer {
  protected declare readonly _args: OpraServiceArgs;
  protected _resources = Responsive<ResourceHandler>();

  constructor(schema: OpraSchema.Service) {
    super(schema);
    if (schema.resources)
      this._addResources(schema.resources);
  }

  get resources(): Record<string, ResourceHandler> {
    return this._resources;
  }

  get servers(): OpraSchema.ServerInfo[] | undefined {
    return this._args.servers;
  }

  getResource<T extends ResourceHandler>(name: string): T {
    const t = this.resources[name];
    if (!t)
      throw new Error(`Resource "${name}" does not exists`);
    return t as T;
  }

  getEntityResource(name: string): EntityResourceHandler {
    const t = this.getResource(name);
    if (!(t instanceof EntityResourceHandler))
      throw new Error(`"${name}" is not an EntityResource`);
    return t;
  }

  getMetadata() {
    const out: OpraSchema.ServiceMetadata = {
      '@opra:metadata': '/$metadata',
      version: OpraVersion,
      servers: this.servers?.map(x => merge({}, x, {deep: true})) as any,
      info: merge({}, this.info, {deep: true}) as any,
      types: [],
      resources: []
    };
    for (const [k, dataType] of Object.entries(this.types)) {
      if (!internalDataTypes.has(k))
        out.types.push(dataType.getMetadata());
    }
    for (const resource of Object.values(this.resources)) {
      out.resources.push(resource.getMetadata());
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
        this.resources[r.name] = new EntityResourceHandler({...r, service: this, dataType});
      } else
        throw new TypeError(`Unknown resource kind (${r.kind})`);
    }

    // Sort data types by name
    const newResources = Responsive<ResourceHandler>();
    Object.keys(this.resources).sort()
        .forEach(name => newResources[name] = this.resources[name]);
    this._resources = newResources;
  }

  static async create(args: SchemaGenerator.GenerateServiceArgs): Promise<OpraService> {
    const schema = await SchemaGenerator.generateServiceSchema(args);
    return new OpraService(schema);
  }

}
