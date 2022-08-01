import { ComplexType, Property } from '@opra/common';

@ComplexType({
  description: 'Address information'
})
export class Address {

  @Property()
  city: string;

  @Property()
  country: string;

  @Property()
  street: string;

  @Property()
  zipCode: string;

}
