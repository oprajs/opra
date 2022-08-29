import { OpraSchema } from '@opra/common';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../helpers/terminal-utils';
import { ExecutionContext } from '../execution-context';
import { ComplexType } from '../data-type/complex-type';

export abstract class Resource {
  protected readonly _args: OpraSchema.Resource;
  readonly dataType: ComplexType;

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

  abstract execute(ctx: ExecutionContext): Promise<void>;

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
