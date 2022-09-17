import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/schema';
import { IResourceContainer } from '../../interfaces/resource-container.interface.js';
import { ExecutionContext } from '../execution-context.js';
import { EntityResourceHandler } from './entity-resource-handler.js';
import { ResourceHandler } from './resource-handler.js';

export type ContainerResourceControllerArgs = StrictOmit<OpraSchema.ContainerResource, 'kind'> & {}

export class ContainerResourceHandler extends ResourceHandler implements IResourceContainer {
  declare protected readonly _args: OpraSchema.ContainerResource;

  constructor(args: ContainerResourceControllerArgs) {
    super({
      kind: 'ContainerResource',
      ...args
    });
  }

  getResource<T extends ResourceHandler>(name: string): T {
    const t = this._args.resources[name];
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(ctx: ExecutionContext): Promise<void> {
    return Promise.resolve(undefined);
  }

}
