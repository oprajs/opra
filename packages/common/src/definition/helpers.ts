import type { OpraCollectionResourceDef } from './resource.definition';

/**
 *
 */
export function isCollectionResourceDef(meta: any): meta is OpraCollectionResourceDef {
  return meta && typeof meta === 'object' && meta.resourceKind === 'collection';
}
