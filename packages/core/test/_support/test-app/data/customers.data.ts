import { faker } from '@faker-js/faker';
import { Customer } from '../entities/customer.entity.js';
import { CustomerNotes } from '../entities/customer-notes.entity.js';
import countriesData from './countries.data.js';

export function enumValue<T>(enumVal: T[]): T {
  const idx = Math.floor(Math.random() * enumVal.length);
  return enumVal[idx];
}

export const customersData: Partial<Customer>[] = [];
export const customerNotes: Partial<CustomerNotes>[] = [];

let noteId = 0;
let gender: string;
for (let id = 1; id <= 1000; id++) {
  gender = enumValue(['M', 'F']);
  const sex = gender === 'M' ? 'male' : 'female';
  const customer: Partial<Customer> = {
    id,
    cid: faker.random.numeric(),
    identity: faker.random.numeric(),
    givenName: faker.name.firstName(sex),
    familyName: faker.name.lastName(sex),
    gender,
    active: enumValue([true, false]),
    birthDate: faker.date.birthdate(),
    countryCode: faker.address.countryCode('alpha-2'),
    deleted: enumValue([true, false]),
    vip: faker.datatype.boolean(),
    city: faker.address.city(),
  }

  const country = countriesData.find(x => x.code === customer.countryCode);
  if (country) {
    customer.address = {
      country,
      countryCode: '' + customer.countryCode,
      city: '' + customer.city,
      street: faker.address.street(),
      zipCode: faker.address.zipCode()
    }
  }

  customersData.push(customer);
  customerNotes.push({
    id: ++noteId,
    customerId: id,
    title: faker.random.words(3),
    text: faker.random.words(10),
    deleted: enumValue([true, false])
  })
}

