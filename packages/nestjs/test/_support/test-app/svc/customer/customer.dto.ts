import { ComplexType } from '@opra/common';

@ComplexType()
export class Customer {

  @ComplexType.Property()
  @ComplexType.PrimaryKey()
  id: number;

  @ComplexType.Property()
  givenName: string;

  @ComplexType.Property()
  familyName: string;

  @ComplexType.Property()
  gender: string;

  @ComplexType.Property()
  birthDate: string;

  @ComplexType.Property()
  city: string;

  @ComplexType.Property()
  countryCode: string;

  @ComplexType.Property()
  active: boolean;

  @ComplexType.Property()
  vip: boolean;

  @ComplexType.Property()
  addressCity: string;

  @ComplexType.Property()
  addressStreet: string;

  @ComplexType.Property()
  zipCode: string;
}
