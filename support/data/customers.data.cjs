const {faker} = require('@faker-js/faker');
const countriesData = require('./countries.data.cjs');

function enumValue(enumVal) {
  const idx = Math.floor(Math.random() * enumVal.length);
  return enumVal[idx];
}

const customers = [];
const customerNotes = [];

let noteId = 0;
let gender;
for (let id = 1; id <= 1000; id++) {
  gender = enumValue(['M', 'F']);
  const sex = gender === 'M' ? 'male' : 'female';
  const customer = {
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
    city: faker.address.city()
  };

  const country = countriesData.find(x => x.code === customer.countryCode);
  if (country) {
    customer.address = {
      country,
      countryCode: '' + customer.countryCode,
      city: '' + customer.city,
      street: faker.address.street(),
      zipCode: faker.address.zipCode()
    };
  }

  customers.push(customer);
  customerNotes.push({
    id: ++noteId,
    customerId: id,
    title: faker.random.words(3),
    text: faker.random.words(10),
    deleted: enumValue([true, false])
  });
}

module.exports = {
  customers,
  customerNotes
};
