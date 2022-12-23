import { OprComplexType, OprField } from '@opra/common';

@OprComplexType({
  description: 'Address information',
  additionalFields: true
})
export class Note {

  @OprField()
  title: string;

  @OprField()
  text: string;

}
