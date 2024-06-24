import { PartialDTO } from 'ts-gems';
import { ApiField, ComplexType } from '@opra/common';
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
  title: string;

  @ApiField()
  text: string;

  @ApiField()
  rank: number;

  @ApiField({ exclusive: true })
  largeContent: string;
}
