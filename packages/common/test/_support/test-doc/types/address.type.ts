import { ComplexType, Expose } from '@opra/common';

@ComplexType({
  description: 'Address information'
})
export class Address {

  @Expose()
  code: number;

  @Expose()
  city: string;

  @Expose()
  street: string;

  @Expose()
  zipCode: string;

}
