import { OprComplexType, OprField } from '@opra/schema';

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
