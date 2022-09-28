import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../opra-schema.interface.js';

export type ApiResolverMetadata = StrictOmit<OpraSchema.MethodResolver, 'handler'>;
