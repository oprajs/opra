import { ApiField, ComplexType } from '@opra/common';
import { Column } from '@sqb/connect';
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
  @Column()
  declare title: string;

  @ApiField()
  @Column()
  declare text: string;

  @ApiField()
  @Column()
  declare rank: number;

  @ApiField({ exclusive: true })
  @Column({ exclusive: true })
  declare largeContent: string;
}
