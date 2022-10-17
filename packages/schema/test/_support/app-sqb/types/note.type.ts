import { OprComplexType, OprField } from '../../../../src/index.js';

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
