import {DtoProperty, DtoSchema} from '@opra/common';

@DtoSchema()
export class Customer {

  @DtoProperty()
  id: number;

  @DtoProperty()
  givenName: string;

  @DtoProperty()
  familyName: string;

  @DtoProperty()
  gender: string;

  @DtoProperty()
  birthDate: string;

  @DtoProperty()
  city: string;

  @DtoProperty()
  countryCode: string;

  @DtoProperty()
  active: boolean;

  @DtoProperty()
  vip: boolean;

  @DtoProperty()
  addressCity: string;

  @DtoProperty()
  addressStreet: string;

  @DtoProperty()
  zipCode: string;
}
