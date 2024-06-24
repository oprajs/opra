import { Column } from '@sqb/connect';
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
  @Column()
  title: string;

  @ApiField()
  @Column()
  text: string;

  @ApiField()
  @Column()
  rank: number;

  @ApiField({ exclusive: true })
  @Column({ exclusive: true })
  largeContent: string;
}
