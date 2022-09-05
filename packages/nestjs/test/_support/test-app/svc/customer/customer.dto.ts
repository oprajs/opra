import { ApiComplexType } from '@opra/common';

@ApiComplexType()
export class Customer {

  @ApiComplexType.Property()
  @ApiComplexType.PrimaryKey()
  id: number;

  @ApiComplexType.Property()
  givenName: string;

  @ApiComplexType.Property()
  familyName: string;

  @ApiComplexType.Property()
  gender: string;

  @ApiComplexType.Property()
  birthDate: string;

  @ApiComplexType.Property()
  city: string;

  @ApiComplexType.Property()
  countryCode: string;

  @ApiComplexType.Property()
  active: boolean;

  @ApiComplexType.Property()
  vip: boolean;

  @ApiComplexType.Property()
  addressCity: string;

  @ApiComplexType.Property()
  addressStreet: string;

  @ApiComplexType.Property()
  zipCode: string;
}
