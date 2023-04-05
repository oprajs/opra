import { Type } from 'ts-gems';
import { PartialOutput } from '@opra/core';
import { EntityMetadata, SqbClient, SqbConnection } from '@sqb/connect';

export abstract class SqbServiceBase<T, TOutput = PartialOutput<T>> {
  protected _entityMetadata: EntityMetadata;

}
