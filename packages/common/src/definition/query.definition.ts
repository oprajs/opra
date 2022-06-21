import type { Type } from 'ts-gems';
import { HttpStatus } from '../enums';
import type { OpraQueryIntent, OpraQueryOperation } from './types';

export interface OpraQueryNode {
  operation: OpraQueryOperation;
  intent: OpraQueryIntent;
  parent?: OpraQueryNode;
  resourceName: string;
  resourceKey?: string | number | Record<string, string | number>;
  returnType: Type;
  returnSchema?: any;
  path: string;
  fields?: Record<string, boolean | OpraQueryNode>;
  sort?: string[];
  limit?: number;
  skip?: number;
  inputValue?: any;
  errors?: any[];
  returnValue?: any;
  returnTotal?: number;
  returnEtag?: string;
  returnHeaders?: Record<string, string>;
  returnExtra?: Record<string, any>;
  status?: HttpStatus;
}
