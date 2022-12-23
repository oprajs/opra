import './env.js';
import {Connection} from 'postgresql-client';
import {faker} from '@faker-js/faker';
import {Insert} from '@sqb/builder';
import {countriesData} from './app/data/countries.data.js';

export default async function globalSetup() {
  const connection = new Connection();
  await connection.connect();
  try {
    const schema = process.env.DB_SCHEMA;
    const sql = getSql(schema);
    await connection.execute(sql);
    await createTestData(connection, schema);
  } finally {
    await connection.close(0);
  }
}

function getSql(schema) {
  return `
DROP SCHEMA IF EXISTS ${schema} CASCADE;
CREATE SCHEMA ${schema} AUTHORIZATION postgres;

CREATE FUNCTION ${schema}.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE ${schema}.countries
(
    code character varying(5),
    name character varying(64), 
    phone_code character varying(8),
    flag character varying(8),   
    CONSTRAINT pk_countries PRIMARY KEY (code)
);

CREATE TABLE ${schema}.customers
(
    id SERIAL,
    given_name character varying(64),
    family_name character varying(64),
    gender char(1),
    birth_date date,
    cid character varying(36),
    identity character varying(36),
    city character varying(32),
    country_code character varying(5),
    active boolean not null default true,
    deleted boolean not null default false,
    vip boolean not null default false,
    address jsonb,
    created_at timestamp default NOW(),
    updated_at timestamp,
    CONSTRAINT pk_customers PRIMARY KEY (id),
    CONSTRAINT fk_customers_country_code FOREIGN KEY (country_code)
        REFERENCES ${schema}.countries (code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

ALTER SEQUENCE ${schema}.customers_id_seq RESTART WITH 10000;

CREATE TRIGGER customers_set_updated_at BEFORE UPDATE ON ${schema}.customers
FOR EACH ROW EXECUTE PROCEDURE ${schema}.trigger_set_updated_at();

CREATE TABLE ${schema}.customer_notes
(
    id SERIAL,
    customer_id int4,
    title character varying(128),
    text character varying(512),    
    created_at timestamp default NOW(),
    updated_at timestamp,
    CONSTRAINT pk_customer_notes PRIMARY KEY (id),
    CONSTRAINT fk_customer_notes_customer_id FOREIGN KEY (customer_id)
        REFERENCES ${schema}.customers (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE TRIGGER customer_notes_set_updated_at BEFORE UPDATE ON ${schema}.customer_notes
FOR EACH ROW EXECUTE PROCEDURE ${schema}.trigger_set_updated_at();


CREATE TABLE ${schema}.tags
(
    id SERIAL,
    name character varying(16),
    color character varying(16),
    active boolean not null default true,
    CONSTRAINT tags_pkey PRIMARY KEY (id)  
);

ALTER SEQUENCE ${schema}.tags_id_seq RESTART WITH 100;

CREATE TABLE ${schema}.customer_tags
(
    customer_id int4 not null,
    tag_id int4 not null,
    deleted boolean not null default false,     
    CONSTRAINT customer_tags_pkey PRIMARY KEY (customer_id, tag_id),
    CONSTRAINT fk_customer_tags_customer_id FOREIGN KEY (customer_id)
        REFERENCES ${schema}.customers (id) MATCH SIMPLE,
    CONSTRAINT fk_customer_tags_tag_id FOREIGN KEY (tag_id)
        REFERENCES ${schema}.tags (id)
);
`;
}

async function createTestData(connection, schema) {
  let lines = [];
  const countryCodes = [];
  for (const row of countriesData) {
    countryCodes.push(row.code);
    lines.push(
        Insert(schema + '.countries', row).generate({dialect: 'postgres'}).sql
    );
  }
  await connection.execute(lines.join(';\n'));

  lines = [];
  for (let i = 1; i <= 1000; i++) {
    const row = {
      id: i,
      cid: faker.datatype.uuid(),
      // eslint-disable-next-line camelcase
      country_code: enumValue(countryCodes),
      city: faker.address.city(),
      identity: faker.datatype.string(10),
      vip: faker.datatype.boolean(),
      gender: enumValue(['M', 'F', 'O', 'U']),
      // eslint-disable-next-line camelcase
      given_name: faker.name.firstName(),
      // eslint-disable-next-line camelcase
      family_name: faker.name.lastName(),
      active: faker.datatype.boolean(),
      // eslint-disable-next-line camelcase
      birth_date: faker.date.birthdate(),
      deleted: faker.datatype.boolean()
    };
    row.address = {
      city: row.city,
      countryCode: row.country_code,
      street: faker.address.street(),
      zipCode: faker.address.zipCode()
    };
    lines.push(
        Insert(schema + '.customers', row)
            .generate({dialect: 'postgres'}).sql
    );
    if (row.id < 10)
      for (let k = 0; k < 1 + Math.round(Math.random() * 3); k++) {
        lines.push(
            Insert(schema + '.customer_notes', {
              // eslint-disable-next-line camelcase
              customer_id: row.id,
              title: faker.datatype.string(10),
              text: faker.datatype.string(20)
            }).generate({dialect: 'postgres'}).sql
        );
      }
  }
  await connection.execute(lines.join(';\n'));
}

function enumValue(enumVal) {
  if (Array.isArray(enumVal)) {
    const idx = Math.floor(Math.random() * enumVal.length);
    return enumVal[idx];
  }
  const keys = Object.keys(enumVal);
  const idx = Math.round(Math.random() * keys.length) - 1;
  return enumVal[keys[idx]];
}
