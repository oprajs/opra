import { OpraSchema } from '@opra/schema';
import { IResourceContainer } from '../../interfaces/resource-container.interface.js';
import { OpraService } from '../opra-service.js';
import { QueryContext } from '../query-context.js';
import { BaseControllerWrapper } from './base-controller-wrapper.js';
import { EntityControllerWrapper } from './entity-controller-wrapper.js';

export class ContainerResourceWrapper extends BaseControllerWrapper implements IResourceContainer {
  declare protected readonly _metadata: OpraSchema.ContainerResource;

  constructor(service: OpraService, metadata: OpraSchema.ContainerResource) {
    super(service, metadata);
  }

  getResource<T extends BaseControllerWrapper>(name: string): T {
    const t = this._metadata.resources[name];
    if (!t)
      throw new Error(`Resource "${name}" does not exists`);
    return t as T;
  }

  getEntityResource(name: string): EntityControllerWrapper {
    const t = this.getResource(name);
    if (!(t instanceof EntityControllerWrapper))
      throw new Error(`"${name}" is not an EntityResource`);
    return t;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(ctx: QueryContext): Promise<void> {
    return Promise.resolve(undefined);
  }

}
