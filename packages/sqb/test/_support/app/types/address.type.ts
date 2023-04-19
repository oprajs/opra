import { ComplexField, ComplexType } from '@opra/common';

@ComplexType()
export class Address {

  @ComplexField()
  city: string;

  @ComplexField()
  countryCode: string;

  @ComplexField()
  street: string;

  @ComplexField()
  zipCode: string;

}
