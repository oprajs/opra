import { ComplexField, ComplexType } from '@opra/common';

@ComplexType({
  description: 'Address information'
})
export class Address {

  @ComplexField()
  code: number;

  @ComplexField()
  city: string;

  @ComplexField()
  street: string;

  @ComplexField()
  zipCode: string;

}
