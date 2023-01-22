const {Connection} = require('postgresql-client');
const {Insert} = require('@sqb/builder');
const countriesData = require('../data/countries.data.cjs');
const {customerNotes, customers} = require('../data/customers.data.cjs');

module.exports = async function initTestSchema() {
  const schema = process.env.PG_SCHEMA || 'opra_test';
  const connection = new Connection({schema: 'postgres'});
  await connection.connect();
  try {
    const sql = getSql(schema);
    await connection.execute(sql);
    await createTestData(connection, schema);
  } finally {
    await connection.close(0);
  }
}

function getSql(schema) {
  return `
LOCK TABLE pg_catalog.pg_namespace;
DROP SCHEMA IF EXISTS ${schema} CASCADE;
CREATE SCHEMA ${schema} AUTHORIZATION postgres;

CREATE OR REPLACE FUNCTION trigger_set_updatedAt()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE ${schema}.countries
(
    code character varying(5),
    name character varying(64), 
    phoneCode character varying(8),
    flag character varying(8),   
    CONSTRAINT pk_countries PRIMARY KEY (code)
);

CREATE TABLE ${schema}.customers
(
    id SERIAL,
    givenName character varying(64),
    familyName character varying(64),
    gender char(1),
    birthDate date,
    cid character varying(36),
    identity character varying(36),
    city character varying(32),
    countryCode character varying(5),
    active boolean not null default true,
    deleted boolean not null default false,
    vip boolean not null default false,
    address jsonb,
    createdAt timestamp default NOW(),
    updatedAt timestamp,
    CONSTRAINT pk_customers PRIMARY KEY (id),
    CONSTRAINT fk_customers_country_code FOREIGN KEY (countryCode)
        REFERENCES ${schema}.countries (code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

ALTER SEQUENCE ${schema}.customers_id_seq RESTART WITH 10000;

CREATE TRIGGER customers_set_updatedAt BEFORE UPDATE ON ${schema}.customers
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updatedAt();

CREATE TABLE ${schema}.customer_notes
(
    id SERIAL,
    customerId int4,
    title character varying(128),
    text character varying(512),    
    deleted boolean not null default false,
    createdAt timestamp default NOW(),
    updatedAt timestamp,
    CONSTRAINT pk_customer_notes PRIMARY KEY (id),
    CONSTRAINT fk_customer_notes_customerId FOREIGN KEY (customerId)
        REFERENCES ${schema}.customers (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE TRIGGER customer_notes_set_updatedAt BEFORE UPDATE ON ${schema}.customer_notes
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updatedAt();


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
    customerId int4 not null,
    tagId int4 not null,
    deleted boolean not null default false,     
    CONSTRAINT customer_tags_pkey PRIMARY KEY (customerId, tagId),
    CONSTRAINT fk_customer_tags_customerId FOREIGN KEY (customerId)
        REFERENCES ${schema}.customers (id) MATCH SIMPLE,
    CONSTRAINT fk_customer_tags_tagId FOREIGN KEY (tagId)
        REFERENCES ${schema}.tags (id)
);

`;
}

async function createTestData(connection, schema) {
  const lines = [];
  for (const row of countriesData) {
    lines.push(
        Insert(schema + '.countries', row).generate({dialect: 'postgres'}).sql
    );
  }

  for (const row of customers) {
    lines.push(
        Insert(schema + '.customers', row)
            .generate({dialect: 'postgres'}).sql
    );
  }

  for (const row of customerNotes) {
    lines.push(
        Insert(schema + '.customer_notes', row)
            .generate({dialect: 'postgres'}).sql
    );
  }

  await connection.execute(lines.join(';\n'));
}
