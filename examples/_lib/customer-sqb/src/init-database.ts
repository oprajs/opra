import { Insert } from '@sqb/builder';
import { Connection } from 'postgrejs';
import type { Country, Customer } from './models/index.js';

export async function initDatabase(options: {
  host?: string;
  schema?: string;
  customers?: Customer[];
  countries?: Country[];
}) {
  const schema = process.env.PG_SCHEMA || 'customer_app';
  const connection = new Connection({
    schema: options.schema || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
  });
  await connection.connect();
  try {
    const sql = getSql(schema);
    await connection.execute(sql);
    const { customers, countries } = options;
    if (countries) {
      const lines: string[] = [];
      for (const row of countries) {
        const line = Insert(schema + '.countries', row).generate({ dialect: 'postgres' }).sql;
        lines.push(line);
      }
      await connection.execute(lines.join(';\n'));
    }
    if (customers) {
      const lines: string[] = [];
      for (const row of customers) {
        const line = Insert(schema + '.customers', row).generate({ dialect: 'postgres' }).sql;
        lines.push(line);
      }
      await connection.execute(lines.join(';\n'));
    }
  } finally {
    await connection.close(0);
  }
}

function getSql(schema: string) {
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

CREATE TABLE ${schema}.temp_customers
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
