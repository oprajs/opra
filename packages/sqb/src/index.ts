import * as _SqbConnect from '@sqb/connect';

export * from './sqb-adapter.js';
export * from './base-entity-resource.js';
export * from './base-entity-service.js';
export type { _SqbConnect as SqbConnect };

const optionalsSymbol = Symbol.for('opra.optional-lib.sqb-connect');
globalThis[optionalsSymbol] = globalThis[optionalsSymbol] || {};
globalThis[optionalsSymbol].SqbConnect = _SqbConnect;

declare global {
  export type SqbConnect = typeof _SqbConnect;
}
