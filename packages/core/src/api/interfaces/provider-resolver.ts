import {EntityProvider} from '../services/entity-provider.js';

export interface ProviderResolver {

  getEntityProviderInstance(entityName: string, ns?: string): EntityProvider | Promise<EntityProvider>;

}
