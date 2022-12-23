/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DocumentBuilder, DocumentBuilderArgs } from '../../../src/index.js';
import {
  Country,
  Customer, CustomerNotes,
  CustomerNotesResource,
  Person, Record
} from '../_support/app-sqb/index.js';

describe('DocumentBuilder', function () {

  const baseArgs: DocumentBuilderArgs = {
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Test api description',
    },
    servers: [{
      url: 'http://tempure.org'
    }]
  };

  it('Should build Document schema', async () => {
    const builder = new DocumentBuilder(baseArgs);
    const schema = builder.buildSchema();
    expect(schema).toStrictEqual({
      version: '1.0',
      ...baseArgs
    });
  })

  it('Should add data types', async () => {
    const builder = new DocumentBuilder(baseArgs);
    await builder.addDataTypeClass(Record);
    await builder.addDataTypeClass(Person);
    const schema = builder.buildSchema();
    expect(schema.types).toBeDefined();
    expect(Object.keys(schema.types!).length).toBeGreaterThan(0)
    expect(Object.keys(schema.types!)).toStrictEqual(['Person', 'Record']);
  })

  it('Should automatically add extending data types', async () => {
    const builder = new DocumentBuilder(baseArgs);
    await builder.addDataTypeClass(CustomerNotes);
    const schema = builder.buildSchema();
    expect(schema.types).toBeDefined();
    expect(Object.keys(schema.types!).length).toBeGreaterThan(0)
    expect(Object.keys(schema.types!)).toStrictEqual([
      'CustomerNotes', 'Note', 'Record']);
  })

  it('Should automatically add field data types', async () => {
    const builder = new DocumentBuilder(baseArgs);
    await builder.addDataTypeClass(Customer);
    const schema = builder.buildSchema();
    expect(schema.types).toBeDefined();
    expect(Object.keys(schema.types!).length).toBeGreaterThan(0)
    expect(Object.keys(schema.types!)).toStrictEqual([
      'Address', 'Continent', 'Country', 'Customer', 'CustomerNotes', 'Note', 'Person', 'Record']);
  })

  it('Should add resource instances', async () => {
    const builder = new DocumentBuilder(baseArgs);
    await builder.addResourceInstance(new CustomerNotesResource());
    const schema = builder.buildSchema();
    expect(schema.resources).toBeDefined();
    expect(Object.keys(schema.resources!).length).toBeGreaterThan(0)
    expect(Object.keys(schema.resources!)).toStrictEqual(['CustomerNotes']);
  })

  it('Should add resource classes', async () => {
    const builder = new DocumentBuilder(baseArgs);
    await builder.addResourceInstance(CustomerNotesResource);
    const schema = builder.buildSchema();
    expect(schema.resources).toBeDefined();
    expect(Object.keys(schema.resources!).length).toBeGreaterThan(0)
    expect(Object.keys(schema.resources!)).toStrictEqual(['CustomerNotes']);
  })

  it('Should add data typed from resources', async () => {
    const builder = new DocumentBuilder(baseArgs);
    await builder.addResourceInstance(CustomerNotesResource);
    const schema = builder.buildSchema();
    expect(schema.types).toBeDefined();
    expect(Object.keys(schema.resources!).length).toBeGreaterThan(0)
    expect(Object.keys(schema.types!)).toStrictEqual([
      'CustomerNotes', 'Note', 'Record']);
  })

  it('Should determine data type from SQB Link', async () => {
    const builder = new DocumentBuilder(baseArgs);
    await builder.addDataTypeClass(Customer);
    await builder.addDataTypeClass(Country);
    const schema = builder.buildSchema();
    let t: any = schema.types?.CustomerNotes;
    expect(t).toBeDefined();
    t = schema.types?.Customer;
    expect(t).toBeDefined();
    let f = t.fields.notes;
    expect(f).toBeDefined();
    expect(f.type).toStrictEqual('CustomerNotes');
    expect(f.isArray).toStrictEqual(true);

    t = schema.types?.Country;
    expect(t).toBeDefined();
    f = t.fields.continent;
    expect(f).toBeDefined();
    expect(f.type).toStrictEqual('Continent');
    expect(f.isArray).toStrictEqual(undefined);
  })

  it('Should determine type info from SQB field', async () => {
    const builder = new DocumentBuilder(baseArgs);
    await builder.addDataTypeClass(Customer);
    await builder.addDataTypeClass(Country);
    const schema = builder.buildSchema();
    const t: any = schema.types?.Customer;
    let f = t.fields.fieldInteger;
    expect(f.type).toStrictEqual('integer');
    f = t.fields.fieldBigint;
    expect(f.type).toStrictEqual('bigint');
    f = t.fields.fieldGuid;
    expect(f.type).toStrictEqual('guid');
    f = t.fields.cid;
    expect(f.required).toStrictEqual(true);
    f = t.fields.identity;
    expect(f.required).toStrictEqual(false);
    f = t.fields.active;
    expect(f.default).toStrictEqual(true);
    f = t.fields.notes;
    expect(f.exclusive).toStrictEqual(true);
    f = t.fields.address;
    expect(f.exclusive).toStrictEqual(true);
    f = t.fields.vip;
    expect(f.exclusive).toStrictEqual(true);
  })

});
