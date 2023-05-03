import { ApiField, ComplexType } from '@opra/common';

@ComplexType({
  description: 'Address information',
  additionalFields: true
})
export class Note {

  @ApiField()
  title: string;

  @ApiField()
  text: string;

}
