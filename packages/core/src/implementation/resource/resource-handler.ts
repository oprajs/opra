import { OpraSchema } from '@opra/schema';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../utils/terminal-utils.js';

export abstract class ResourceHandler {
  protected readonly _args: OpraSchema.Resource;

  protected constructor(args: OpraSchema.Resource) {
    this._args = args;
  }

  get name(): string {
    return this._args.name;
  }

  get description(): string | undefined {
    return this._args.description;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
