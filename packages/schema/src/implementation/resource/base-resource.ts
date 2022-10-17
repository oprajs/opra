import { OpraSchema } from '../../opra-schema.js';
import { cloneObject } from '../../utils/clone-object.util.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../utils/inspect-utils.js';
import { OpraApi } from '../opra-api.js';

export abstract class OpraResource {
  readonly metadata: OpraSchema.Resource;
  readonly owner: OpraApi;
  protected path: string;

  protected constructor(owner: OpraApi, metadata: OpraSchema.Resource) {
    this.owner = owner;
    this.metadata = metadata;
  }

  get instance(): {} | undefined {
    return this.metadata.instance;
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

  validateQueryOptions(): any {
    //
  }

  getSchema(jsonOnly?: boolean): OpraSchema.Resource {
    return cloneObject(this.metadata, jsonOnly);
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
