import { ComplexType, Expose } from '@opra/common';

@ComplexType()
export class Address {

  @Expose()
  city: string;

  @Expose()
  countryCode: string;

  @Expose()
  street: string;

  @Expose()
  zipCode: string;

}
