/* eslint-disable import/extensions */
import { Connection } from 'postgresql-client';
import { Insert } from '@sqb/builder';
import { countriesData } from './countries.data';
import { customersData } from './customers.data';

export async function initPostgres() {
  const schema = process.env.PG_SCHEMA || 'opra_test';
  const connection = new Connection({schema: 'postgres'});
  await connection.connect();
  try {
    const sql = getSql(schema);
    await connection.execute(sql);
    await createTestData(connection, schema);
  } catch (e) {
    throw e;
  } finally {
    await connection.close(0);
  }
}

function getSql(schema) {
  return `
DROP SCHEMA IF EXISTS ${schema} CASCADE;
CREATE SCHEMA ${schema} AUTHORIZATION postgres;

CREATE TABLE ${schema}.my_profile
(
    _id SERIAL PRIMARY KEY,
    givenName character varying(64),
    familyName character varying(64),
    gender char(1),
    birthDate date,
    address jsonb,
    deleted boolean not null default false,
    createdAt timestamp default NOW(),
    updatedAt timestamp
);

CREATE TABLE ${schema}.countries
(
    code character varying(5) PRIMARY KEY,
    name character varying(64), 
    phoneCode character varying(8),
    flag character varying(8) 
);

CREATE TABLE ${schema}.customers
(
    _id SERIAL PRIMARY KEY,
    givenName character varying(64),
    familyName character varying(64),
    gender char(1),
    birthDate date,
    uid character varying(36),
    countryCode character varying(5),
    active boolean not null default true,   
    vip boolean not null default false,
    rate numeric,
    address jsonb,
    notes jsonb,
    deleted boolean not null default false,
    createdAt timestamp default NOW(),
    updatedAt timestamp,
    CONSTRAINT fk_customers_country_code FOREIGN KEY (countryCode)
        REFERENCES ${schema}.countries (code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

`;
}

async function createTestData(connection, schema) {
  const lines: string[] = [];
  for (const row of countriesData) {
    const line = Insert(schema + '.countries', row)
        .generate({dialect: 'postgres'}).sql;
    lines.push(line);
  }

  for (const row of customersData) {
    lines.push(
        Insert(schema + '.customers', row)
            .generate({dialect: 'postgres'}).sql
    );
  }

  await connection.execute(lines.join(';\n'));
}
