import type { OpraListOperationDef, OpraReadOperationDef } from './operation.definition';
import type { OpraResourceKind } from './types';

export type OpraResourceDef = OpraCollectionResourceDef | OpraSingletonResourceDef;


/**
 *
 */
export type OpraBaseResourceDef = {
  resourceKind: OpraResourceKind;
  name: string;
  description?: string;
};


/**
 *
 */
export type OpraCollectionResourceDef = OpraBaseResourceDef & {
  resourceKind: 'collection',
  entitySchema: string;
  operations: {
    list?: OpraListOperationDef;
    read?: OpraReadOperationDef;
  }
}

/**
 *
 */
export type OpraSingletonResourceDef = OpraBaseResourceDef & {}


