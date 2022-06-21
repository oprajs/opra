import {Type} from 'ts-gems';
import {OPRA_COLLECTION_METADATA} from '../../constants.js';
import {resolveClassName} from '../../utils/class-utils.js';
import {ApiCollectionMetadata} from '../interfaces/collection-metadata.interface.js';

export type ApiCollectionOptions = Partial<ApiCollectionMetadata> & {
  entity: Type
};

const collectionNameRegEx = /[a-z]\w*/i;

export function defineCollection(ctor: Type, options?: ApiCollectionOptions) {

  const name = options?.name || resolveClassName(ctor);
  if (!name)
    throw new TypeError('Unable to resolve type name');
  if (!collectionNameRegEx.test(name))
    throw new TypeError(`"${name}" is not a valid resource name`);

  const collectionMeta: ApiCollectionMetadata = {
    name
  }

  Reflect.defineMetadata(OPRA_COLLECTION_METADATA, collectionMeta, ctor);

  return collectionMeta;

}
