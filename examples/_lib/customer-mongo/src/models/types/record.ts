import { ApiField, ComplexType } from '@opra/common';
import { type PartialDTO } from 'ts-gems';

@ComplexType({
  abstract: true,
  description: 'Base Record schema',
  keyField: '_id',
})
export class Record {
  constructor(init?: PartialDTO<Record>) {
    Object.assign(this, init);
  }

  @(ApiField({
    readonly: true,
  }).Override('db', {
    readonly: false,
  }))
  declare _id: number;

  @(ApiField({
    readonly: true,
  }).Override('db', {
    readonly: false,
  }))
  declare deleted?: boolean;

  @(ApiField({
    readonly: true,
  }).Override('db', {
    readonly: false,
  }))
  declare createdAt: Date;

  @(ApiField({
    readonly: true,
  }).Override('db', {
    readonly: false,
  }))
  declare updatedAt?: Date;
}
