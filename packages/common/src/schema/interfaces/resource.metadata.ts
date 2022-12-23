import { PartialSome, StrictOmit } from 'ts-gems';
import { OpraSchema } from '../opra-schema.definition.js';
import { TypeThunkAsync } from '../types.js';

export type CollectionResourceMetadata = PartialSome<StrictOmit<OpraSchema.CollectionResource, 'type'>, 'keyFields'> &
    {
      type: TypeThunkAsync | string;
      name: string;
    };


export type SingletonResourceMetadata = StrictOmit<OpraSchema.SingletonResource, 'type'> &
    {
      type: TypeThunkAsync | string;
      name: string;
    };


export type ICreateResolverMetadata = StrictOmit<OpraSchema.CreateMethodResolver, 'handler'>;
export type IDeleteResolverMetadata = StrictOmit<OpraSchema.DeleteMethodResolver, 'handler'>;
export type IDeleteManyResolverMetadata = StrictOmit<OpraSchema.DeleteManyMethodResolver, 'handler'>;
export type IGetResolverMetadata = StrictOmit<OpraSchema.GetMethodResolver, 'handler'>;
export type IUpdateResolverMetadata = StrictOmit<OpraSchema.UpdateMethodResolver, 'handler'>;
export type IUpdateManyResolverMetadata = StrictOmit<OpraSchema.UpdateManyMethodResolver, 'handler'>;
export type ISearchResolverMetadata = StrictOmit<OpraSchema.SearchMethodResolver, 'handler'>;
