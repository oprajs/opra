import type { OpraResourceDef } from './resource.definition';
import type { OpraSchema } from './schema-definition.interface';

/**
 *
 */
export interface OpraServiceDef {
  name: string;
  description?: string;
  prefix?: string;
  schemas: Record<string, OpraSchema>;
  resources: Record<string, OpraResourceDef>;
}
