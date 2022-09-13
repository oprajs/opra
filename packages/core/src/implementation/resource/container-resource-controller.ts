import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { ResourceContainer } from '../../interfaces/resource-container.interface.js';
import { EntityResourceInfo } from './entity-resource-info.js';
import { ResourceInfo } from './resource-info.js';

export type ContainerResourceControllerArgs = StrictOmit<OpraSchema.ContainerResource, 'kind'> & {}

export class ContainerResourceController extends ResourceInfo implements ResourceContainer {
  declare protected readonly _args: OpraSchema.ContainerResource;

  constructor(args: ContainerResourceControllerArgs) {
    super({
      kind: 'ContainerResource',
      ...args
    });
  }

  getResource<T extends ResourceInfo>(name: string): T {
    const t = this._args.resources[name];
    if (!t)
      throw new Error(`Resource "${name}" does not exists`);
    return t as T;
  }

  getEntityResource(name: string): EntityResourceInfo {
    const t = this.getResource(name);
    if (!(t instanceof EntityResourceInfo))
      throw new Error(`"${name}" is not an EntityResource`);
    return t;
  }

}
