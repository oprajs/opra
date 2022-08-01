import { OpraSchema } from '@opra/common';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../helpers/terminal-utils';

export abstract class Resource {
  protected readonly _args: any;

  protected constructor(args: OpraSchema.BaseResource) {
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
