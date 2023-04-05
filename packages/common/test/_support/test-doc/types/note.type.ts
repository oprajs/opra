import { ComplexType, Expose } from '@opra/common';

@ComplexType({
  description: 'Address information',
  additionalElements: true
})
export class Note {

  @Expose()
  title: string;

  @Expose()
  text: string;

}
