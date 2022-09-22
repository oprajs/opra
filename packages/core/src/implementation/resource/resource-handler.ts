import merge from 'putil-merge';
import { OpraSchema } from '@opra/schema';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../utils/terminal-utils.js';
import { QueryContext } from '../query-context.js';

export abstract class ResourceHandler {
  protected readonly _args: OpraSchema.Resource;
  protected path: string;

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

  async prepare(ctx: QueryContext): Promise<void> {
    const {query} = ctx;
    const fn = this._args['pre_' + query.queryType];
    if (fn && typeof fn === 'function') {
      await fn(ctx);
    }
  }

  getMetadata(): any {
    return merge({}, {
      ...this._args,
      instance: undefined,
    }, {
      deep: true,
      filter: (source: object, key: string) => {
        return (key !== 'instance' && typeof source[key] !== 'function' && source[key] != null)
      }
    });
  }

  abstract execute(ctx: QueryContext): Promise<void>;

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
