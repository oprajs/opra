import {ResolveAction, PartialInput, PartialOutput} from '../../types.js';
import {OpraContext} from '../interfaces/context.interface.js';
import {ResourceList} from '../interfaces/resource-list.interface.js';


export abstract class EntityProvider<TResource = any,
  TCreateInput extends PartialInput<TResource> = PartialInput<TResource>,
  TUpdateInput extends PartialInput<TResource> = PartialInput<TResource>> {

  protected onError?(context: OpraContext, e: unknown, action: string, args?: any): void | Promise<void>;


  get resourceName(): string {
    return '';// this._resourceName || this.resourceType.name;
  }

  abstract processSearchRequest(context: OpraContext): Promise<ResourceList<PartialOutput<TResource>>>;

  async processRequest(action: ResolveAction, context: OpraContext): Promise<ResourceList<PartialOutput<TResource>>> {
    switch (action) {
      case 'search': {
        return this.processSearchRequest(context);
      }
    }
    throw new Error(`Unknown action type "${action}"`);
  }

}
