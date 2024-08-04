import { ApiField, ComplexType } from '@opra/common';
import { PartialDTO } from 'ts-gems';
import { Record } from './record.js';

@ComplexType({
  description: 'Address information',
  additionalFields: true,
})
export class Note extends Record {
  constructor(init?: PartialDTO<Note>) {
    super(init);
  }

  @ApiField()
  declare title: string;

  @ApiField()
  declare text: string;

  @ApiField()
  declare rank: number;

  @ApiField({ exclusive: true })
  declare largeContent: string;
}
