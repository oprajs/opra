import { PartialDTO } from 'ts-gems';
import { ApiField, ComplexType } from '@opra/common';

@ComplexType({
  description: 'Address information',
  additionalFields: true,
})
export class Note {
  constructor(init?: PartialDTO<Note>) {
    Object.assign(this, init);
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
