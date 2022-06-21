import {DtoProperty,DtoSchema} from '@opra/common';

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

const data = [
  {
    "id": 1,
    "givenName": "Wynne",
    "familyName": "Silva",
    "gender": "M",
    "birthDate": "1976-08-13T00:08:37-07:00",
    "city": "Norman",
    "countryCode": "US",
    "active": true,
    "vip": true,
    "addressCity": "Norman",
    "addressStreet": "53. Street",
    "zipCode": "12345"
  },
  {
    "id": 2,
    "givenName": "Erica",
    "gender": "F",
    "familyName": "Fowler",
    "birthDate": "2018-06-18T00:01:49-07:00",
    "city": "Diyarbakır",
    "countryCode": "TR",
    "addressCity": "Diyarbakır",
    "addressStreet": "Ataturk Cd.",
    "zipCode": "12424"
  },
  {
    "id": 3,
    "givenName": "Belle",
    "gender": "F",
    "familyName": "Marsh",
    "birthDate": "1996-02-06T04:20:46-08:00",
    "city": "Erciş",
    "countryCode": "TR",
    "vip": true,
    "addressCity": "Erciş",
    "addressStreet": "Cumhuriyet Cd",
    "zipCode": "3432"
  },
  {
    "id": 4,
    "givenName": "Burke",
    "gender": "M",
    "familyName": "Kidd",
    "birthDate": "2006-04-22T17:01:02-07:00",
    "city": "Dallas",
    "countryCode": "US",
    "active": false,
    "vip": true,
    "addressCity": "Dallas",
    "addressStreet": "Kennedy St.",
    "zipCode": "22542"
  },
  {
    "id": 5,
    "givenName": "Clinton",
    "gender": "M",
    "familyName": "Collier",
    "birthDate": "2009-11-09T12:33:57-08:00",
    "city": "Balıkesir",
    "countryCode": "TR",
    "active": false,
    "vip": true
  },
  {
    "id": 6,
    "givenName": "Maxwell",
    "gender": "M",
    "familyName": "Mcfarland",
    "birthDate": "1994-10-11T10:09:54-07:00",
    "city": "Butte",
    "countryCode": "US",
    "vip": true
  },
  {
    "id": 7,
    "givenName": "Olympia",
    "gender": "F",
    "familyName": "Miles",
    "birthDate": "1980-05-18T09:37:40-07:00",
    "city": "Smoky Lake",
    "countryCode": "CA",
    "active": false,
    "vip": true
  },
  {
    "id": 8,
    "givenName": "Isaiah",
    "gender": "M",
    "familyName": "Crosby",
    "birthDate": "2002-12-22T19:33:45-08:00",
    "city": "Marystown",
    "countryCode": "CA",
    "vip": true
  },
  {
    "id": 9,
    "givenName": "Imani",
    "gender": "M",
    "familyName": "Wolf",
    "birthDate": "1970-01-20T02:34:32-08:00",
    "city": "Owensboro",
    "countryCode": "US"
  },
  {
    "id": 10,
    "givenName": "Charity",
    "gender": "M",
    "familyName": "Mack",
    "birthDate": "1962-06-24T21:31:40-07:00",
    "city": "Cincinnati",
    "countryCode": "US"
  }
]

const keyProperty = 'id';

export {
  data,
  keyProperty
};
