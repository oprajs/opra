import { faker } from '@faker-js/faker';
import { SqbClient } from '@sqb/connect';
import countriesData from './data/countries.data.js';
import { Country } from './types/entities/country.entity.js';
import { Customer } from './types/entities/customer.entity.js';

export const customersData: Customer[] = [];

export async function createDatabase(dbClient: SqbClient, schema: string) {
  const sql = getSql(schema);
  const conn = await dbClient.acquire();
  try {
    (conn as any)._intlcon.intlcon.execute(sql);
  } finally {
    await conn.close();
  }
  const countryRepo = dbClient.getRepository(Country);
  for (const country of countriesData)
    await countryRepo.createOnly(country);
  const customerRepo = dbClient.getRepository(Customer);
  for (const customer of customersData)
    await customerRepo.createOnly(customer);
}


function getSql(schema: string) {
  return `
LOCK TABLE pg_catalog.pg_namespace;
DROP SCHEMA IF EXISTS ${schema} CASCADE;
CREATE SCHEMA ${schema} AUTHORIZATION postgres;

CREATE TABLE ${schema}.countries
(
    code character varying(2),
    name character varying(100),
    CONSTRAINT pk_countries PRIMARY KEY (code)
);

CREATE TABLE ${schema}.customers
(
    id SERIAL,
    deleted boolean not null default false,
    given_name character varying(64),
    family_name character varying(64),
    gender char(1),
    birth_date date,
    created_by json,
    address_country_code varchar(2),
    address_city varchar(32),
    address_street varchar(256),
    address_zip_code varchar(8),
    CONSTRAINT pk_customers PRIMARY KEY (id)
);

ALTER SEQUENCE ${schema}.customers_id_seq RESTART WITH 10000;

CREATE TABLE ${schema}.customer_notes
(
    customer_id int4,
    title character varying(256),
    contents character varying(256),    
    CONSTRAINT pk_customer_details PRIMARY KEY (customer_id),
    CONSTRAINT fk_customer_details_customer_id FOREIGN KEY (customer_id)
        REFERENCES ${schema}.customers (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE ${schema}.settings
(
    id SERIAL,
    company_name character varying(256),
    company_email character varying(256),
    session_timeout integer              
);

`
}

function generateData() {
  let gender;
  for (let id = 1; id <= 1000; id++) {
    gender = enumValue(['M', 'F']);
    const sex = gender === 'M' ? 'male' : 'female';
    const countryCode = faker.location.countryCode('alpha-2');
    const customer: Customer = {
      id,
      givenName: faker.person.firstName(sex),
      familyName: faker.person.lastName(sex),
      gender,
      birthDate: faker.date.birthdate(),
      deleted: enumValue([true, false]),
      address: {
        countryCode,
        city: '' + faker.location.city(),
        street: faker.location.street(),
        zipCode: faker.location.zipCode('#####')
      }
    };
    customersData.push(customer);
    // customer.notes?.push({
    //   title: faker.lorem.words(3),
    //   text: faker.lorem.words(10)
    // });
  }
}


function enumValue(enumVal) {
  const idx = Math.floor(Math.random() * enumVal.length);
  return enumVal[idx];
}

generateData();
