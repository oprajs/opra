import { OpraSchema } from '../../interfaces/opra-schema.interface.js';
import { cloneObject } from '../../utils/clone-object.util.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../utils/inspect-utils.js';
import { OpraService } from '../opra-service.js';

export abstract class BaseResource {
  readonly metadata: OpraSchema.Resource;
  readonly service: OpraService;
  protected path: string;

  protected constructor(service: OpraService, metadata: OpraSchema.Resource) {
    this.service = service;
    this.metadata = metadata;
  }

  get kind(): OpraSchema.ResourceKind {
    return this.metadata.kind;
  }

  get name(): string {
    return this.metadata.name;
  }

  get description(): string | undefined {
    return this.metadata.description;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name}]`;
  }

  getSchema(jsonOnly?: boolean): OpraSchema.Resource {
    return cloneObject(this.metadata, jsonOnly);
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
