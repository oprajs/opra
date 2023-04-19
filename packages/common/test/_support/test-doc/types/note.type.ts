import { ComplexField, ComplexType } from '@opra/common';

@ComplexType({
  description: 'Address information',
  additionalFields: true
})
export class Note {

  @ComplexField()
  title: string;

  @ComplexField()
  text: string;

}
