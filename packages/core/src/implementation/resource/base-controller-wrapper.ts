import { OpraSchema } from '@opra/schema';
import { cloneObject } from '../../utils/clone-object.util.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../utils/terminal-utils.js';
import { OpraService } from '../opra-service.js';
import { QueryContext } from '../query-context.js';

export abstract class BaseControllerWrapper {
  protected readonly _metadata: OpraSchema.Resource;
  readonly service: OpraService;
  protected path: string;

  protected constructor(service: OpraService, metadata: OpraSchema.Resource) {
    this.service = service;
    this._metadata = metadata;
  }

  get name(): string {
    return this._metadata.name;
  }

  get description(): string | undefined {
    return this._metadata.description;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name}]`;
  }

  async prepare(ctx: QueryContext): Promise<void> {
    const {query} = ctx;
    const fn = this._metadata['pre_' + query.queryType];
    if (fn && typeof fn === 'function') {
      await fn(ctx);
    }
  }

  getMetadata(jsonOnly?: boolean): OpraSchema.Resource {
    return cloneObject(this._metadata, jsonOnly);
  }

  abstract execute(ctx: QueryContext): Promise<void>;

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
