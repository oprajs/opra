import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/schema';

export type ApiResolverMetadata = StrictOmit<OpraSchema.ResolverInfo, 'handler'>;
