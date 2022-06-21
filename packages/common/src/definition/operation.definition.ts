import { OpraResolverFunction } from './types';

export interface OpraBaseOperationDef {
  resolver: OpraResolverFunction;
  methodName?: string;
}

export type OpraListOperationDef = OpraBaseOperationDef & {
  maxLimit?: number;
  defaultLimit?: number;
}

export type OpraReadOperationDef = OpraBaseOperationDef & {}
