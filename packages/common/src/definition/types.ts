import type { OpraQueryNode } from './query.definition';

export type OpraResourceKind = 'collection' | 'namespace' | 'singleton';
export type OpraResolverFunction = (query: OpraQueryNode, userContext?: any) => any | Promise<any>;

export type OpraQueryOperation = 'read' | 'create' | 'update' | 'patch' | 'delete' | 'execute';
export type OpraQueryIntent = 'collection' | 'instance' | 'function' | 'property';
