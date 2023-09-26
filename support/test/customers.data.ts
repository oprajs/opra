import { faker } from '@faker-js/faker';

function enumValue(enumVal) {
  const idx = Math.floor(Math.random() * enumVal.length);
  return enumVal[idx];
}

export const customersData: any[] = [];

let gender;
for (let _id = 1; _id <= 1000; _id++) {
  gender = enumValue(['M', 'F']);
  const sex = gender === 'M' ? 'male' : 'female';
  const countryCode = faker.location.countryCode('alpha-2');
  const customer: any = {
    _id,
    uid: faker.string.uuid(),
    givenName: faker.person.firstName(sex),
    familyName: faker.person.lastName(sex),
    gender,
    birthDate: faker.date.birthdate(),
    active: enumValue([true, false]),
    countryCode,
    deleted: enumValue([true, false]),
    rate: Math.floor(Math.random() * 10),
    address: {
      countryCode,
      city: '' + faker.location.city(),
      street: faker.location.street(),
      zipCode: faker.location.zipCode()
    },
    notes: [],
    createdAt: new Date()
  };

  customersData.push(customer);
  customer.notes?.push({
    title: faker.lorem.words(3),
    text: faker.lorem.words(10)
  });
}
