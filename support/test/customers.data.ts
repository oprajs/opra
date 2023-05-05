import { faker } from '@faker-js/faker';
import type { Customer } from '@opra/common/test/_support/test-api/entities/customer.entity.js';

function enumValue(enumVal) {
  const idx = Math.floor(Math.random() * enumVal.length);
  return enumVal[idx];
}

export const customersData: Customer[] = [];

let gender;
for (let _id = 1; _id <= 1000; _id++) {
  gender = enumValue(['M', 'F']);
  const sex = gender === 'M' ? 'male' : 'female';
  const countryCode = faker.address.countryCode('alpha-2');
  const customer: Customer = {
    _id,
    uid: faker.datatype.uuid(),
    givenName: faker.name.firstName(sex),
    familyName: faker.name.lastName(sex),
    gender,
    birthDate: faker.date.birthdate(),
    active: enumValue([true, false]),
    countryCode,
    deleted: enumValue([true, false]),
    rate: Math.floor(Math.random() * 10),
    address: {
      countryCode,
      city: '' + faker.address.city(),
      street: faker.address.street(),
      zipCode: faker.address.zipCode()
    },
    notes: [],
    createdAt: new Date()
  };

  customersData.push(customer);
  customer.notes?.push({
    title: faker.random.words(3),
    text: faker.random.words(10)
  });
}
