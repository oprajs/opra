import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { Responsive } from '../helpers/responsive-object.js';
import { ResourceContainer } from '../interfaces/resource-container.interface.js';
import { ComplexType } from './data-type/complex-type.js';
import { OpraDocument } from './opra-document.js';
import { EntityResourceController } from './resource/entity-resource-controller.js';
import { ResourceController } from './resource/resource-controller.js';
import { SchemaGenerator } from './schema-generator.js';

export type OpraServiceArgs = StrictOmit<OpraSchema.Service, 'version' | 'types' | 'resources'>;

export class OpraService extends OpraDocument implements ResourceContainer {
  protected declare readonly _args: OpraServiceArgs;
  protected _resources = Responsive<ResourceController>();

  constructor(schema: OpraSchema.Service) {
    super(schema);
    if (schema.resources)
      this._addResources(schema.resources);
  }

  get resources(): Record<string, ResourceController> {
    return this._resources;
  }

  get servers(): OpraSchema.ServerInfo[] | undefined {
    return this._args.servers;
  }

  getResource<T extends ResourceController>(name: string): T {
    const t = this.resources[name];
    if (!t)
      throw new Error(`Resource "${name}" does not exists`);
    return t as T;
  }

  getEntityResource(name: string): EntityResourceController {
    const t = this.getResource(name);
    if (!(t instanceof EntityResourceController))
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
        this.resources[r.name] = new EntityResourceController({...r, dataType});
      } else
        throw new TypeError(`Unknown resource kind (${r.kind})`);
    }

    // Sort data types by name
    const newResources = Responsive<ResourceController>();
    Object.keys(this.resources).sort()
        .forEach(name => newResources[name] = this.resources[name]);
    this._resources = newResources;
  }

  static async create(args: SchemaGenerator.GenerateServiceArgs): Promise<OpraService> {
    const schema = await SchemaGenerator.generateServiceSchema(args);
    return new OpraService(schema);
  }

}
