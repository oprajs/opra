import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { Responsive } from '../helpers/responsive-object';
import { ComplexType } from './data-type/complex-type';
import { OpraDocument } from './opra-document';
import { EntityResource } from './resource/entity-resource';
import type { Resource } from './resource/resource';
import { SchemaGenerator } from './schema-generator';

export type OpraServiceArgs = StrictOmit<OpraSchema.Service, 'version' | 'types' | 'resources'>;

export class OpraService extends OpraDocument {
  protected declare readonly _args: OpraServiceArgs;
  protected _resources = Responsive<Resource>();

  constructor(schema: OpraSchema.Service) {
    super(schema);
    if (schema.resources)
      this._addResources(schema.resources);
  }

  get resources(): Record<string, Resource> {
    return this._resources;
  }

  get servers(): OpraSchema.ServerInfo[] | undefined {
    return this._args.servers;
  }

  getResource<T extends Resource>(name: string): T {
    const t = this.resources[name];
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

  protected _addResources(resources: OpraSchema.Resource[]): void {
    for (const r of resources) {
      if (OpraSchema.isEntityResource(r)) {
        const dataType = this.getDataType(r.type);
        if (!dataType)
          throw new TypeError(`Datatype "${r.type}" declared in EntityResource (${r.name}) does not exists`);
        if (!(dataType instanceof ComplexType))
          throw new TypeError(`${r.type} is not an ComplexType`);
        this.resources[r.name] = new EntityResource({...r, dataType});
      } else
        throw new TypeError(`Unknown resource kind (${r.kind})`);
    }

    // Sort data types by name
    const newResources = Responsive<Resource>();
    Object.keys(this.resources).sort()
        .forEach(name => newResources[name] = this.resources[name]);
    this._resources = newResources;
  }

  static async create(args: SchemaGenerator.GenerateServiceArgs): Promise<OpraService> {
    const schema = await SchemaGenerator.generateServiceSchema(args);
    return new OpraService(schema);
  }

}
