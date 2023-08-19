import type { DataType } from '../data-type/data-type.interface.js';
import type { Source, SourceBase } from './source.interface.js';

export interface Container extends SourceBase {
  kind: Container.Kind;
  types?: Record<DataType.Name, DataType>;
  sources?: Record<Source.Name, Source>;
}

export namespace Container {
  export const Kind = 'Container';
  export type Kind = 'Container';
}
