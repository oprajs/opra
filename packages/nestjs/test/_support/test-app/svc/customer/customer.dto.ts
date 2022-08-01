import { ComplexDto } from '@opra/common';

@ComplexDto()
export class Customer {

  @ComplexDto.Property()
  @ComplexDto.PrimaryKey()
  id: number;

  @ComplexDto.Property()
  givenName: string;

  @ComplexDto.Property()
  familyName: string;

  @ComplexDto.Property()
  gender: string;

  @ComplexDto.Property()
  birthDate: string;

  @ComplexDto.Property()
  city: string;

  @ComplexDto.Property()
  countryCode: string;

  @ComplexDto.Property()
  active: boolean;

  @ComplexDto.Property()
  vip: boolean;

  @ComplexDto.Property()
  addressCity: string;

  @ComplexDto.Property()
  addressStreet: string;

  @ComplexDto.Property()
  zipCode: string;
}
