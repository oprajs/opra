import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { PartialOutput } from '../../types';
import { ComplexType } from '../data-type/complex-type';
import { Resource } from './resource';

export type EntityResourceArgs = StrictOmit<OpraSchema.EntityResource, 'kind'> & {
  dataType: ComplexType;
}

export class EntityResource<T> extends Resource {
  declare protected readonly _args: OpraSchema.EntityResource;
  readonly dataType: ComplexType;
  read: (ctx: any) => PartialOutput<T>;

  constructor(args: EntityResourceArgs) {
    super({
      kind: 'EntityResource',
      ..._.omit(args, 'dataType')
    });
    this.dataType = args.dataType;
  }

  get primaryKey(): string | string[] {
    return this._args.primaryKey;
  }

}
