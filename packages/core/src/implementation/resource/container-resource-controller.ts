import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { ResourceContainer } from '../../interfaces/resource-container.interface.js';
import { EntityResourceController } from './entity-resource-controller.js';
import { ResourceController } from './resource-controller.js';

export type ContainerResourceControllerArgs = StrictOmit<OpraSchema.ContainerResource, 'kind'> & {}

export class ContainerResourceController extends ResourceController implements ResourceContainer {
  declare protected readonly _args: OpraSchema.ContainerResource;

  constructor(args: ContainerResourceControllerArgs) {
    super({
      kind: 'ContainerResource',
      ...args
    });
  }

  getResource<T extends ResourceController>(name: string): T {
    const t = this._args.resources[name];
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

}
