import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';

export type ICreateResolverMetadata = StrictOmit<OpraSchema.CreateMethodResolver, 'handler'>;
export type IDeleteResolverMetadata = StrictOmit<OpraSchema.DeleteMethodResolver, 'handler'>;
export type IDeleteManyResolverMetadata = StrictOmit<OpraSchema.DeleteManyMethodResolver, 'handler'>;
export type IGetResolverMetadata = StrictOmit<OpraSchema.GetMethodResolver, 'handler'>;
export type IUpdateResolverMetadata = StrictOmit<OpraSchema.UpdateMethodResolver, 'handler'>;
export type IUpdateManyResolverMetadata = StrictOmit<OpraSchema.UpdateManyMethodResolver, 'handler'>;
export type ISearchResolverMetadata = StrictOmit<OpraSchema.SearchMethodResolver, 'handler'>;
