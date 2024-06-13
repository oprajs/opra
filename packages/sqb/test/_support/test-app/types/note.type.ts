import { ApiField, ComplexType } from '@opra/common';
import { Column } from '@sqb/connect';

@ComplexType({
  description: 'Address information',
  additionalFields: true,
})
export class Note {
  @ApiField()
  @Column()
  title: string;

  @ApiField()
  @Column()
  text: string;
}
