/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument,
  ApiDocumentFactory,
  OpraSchema,
} from '@opra/common';

describe('Built-in types', function () {
  let api: ApiDocument;
  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
    }
  };

  beforeAll(async () => {
    api = await ApiDocumentFactory.createDocument(baseArgs);
  })

  afterAll(() => global.gc && global.gc());

  it('Should decode "any" type', async () => {
    const dt = api.getSimpleType('any');
    expect(dt.decode('t')).toStrictEqual('t');
    expect(dt.decode(1)).toStrictEqual(1);
  })

  it('Should encode "any" type', async () => {
    const dt = api.getSimpleType('any');
    expect(dt.encode('t')).toStrictEqual('t');
    expect(dt.encode(1)).toStrictEqual(1);
  })

  it('Should decode "base64" type', async () => {
    const dt = api.getSimpleType('base64');
    expect(dt.decode('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n')).toStrictEqual('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n');
  })

  it('Should encode "base64" type', async () => {
    const dt = api.getSimpleType('base64');
    expect(dt.encode('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n')).toStrictEqual('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n');
  })

  it('Should decode "boolean" type', async () => {
    const dt = api.getSimpleType('boolean');
    expect(dt.decode('t', {coerce: true})).toStrictEqual(true);
    expect(dt.decode(true)).toStrictEqual(true);
    expect(dt.decode(false)).toStrictEqual(false);
  })

  it('Should encode "boolean" type', async () => {
    const dt = api.getSimpleType('boolean');
    expect(dt.encode('t', {coerce: true})).toStrictEqual(true);
    expect(dt.encode(true)).toStrictEqual(true);
    expect(dt.encode(false)).toStrictEqual(false);
  })

  it('Should decode "date" type', async () => {
    const dt = api.getSimpleType('date');
    expect(dt.decode('2020-01-02T10:30:00', {coerce: true})).toStrictEqual(new Date('2020-01-02T00:00:00'));
    expect(dt.decode('2020-01-02', {coerce: true})).toStrictEqual(new Date('2020-01-02T00:00:00'));
    expect(dt.decode('2020', {coerce: true})).toStrictEqual(new Date('2020-01-01T00:00:00'));
    expect(dt.decode('2020-01-02T10:30:00', {coerce: true})).toStrictEqual(new Date('2020-01-02T00:00:00'));
  })

  it('Should encode "date" type', async () => {
    const dt = api.getSimpleType('date');
    expect(dt.encode(new Date('2020-01-02T00:00:00'))).toStrictEqual('2020-01-02');
  })

  it('Should decode "integer" type', async () => {
    const dt = api.getSimpleType('integer');
    expect(dt.decode('123', {coerce: true})).toStrictEqual(123);
    expect(dt.decode(123)).toStrictEqual(123);
  })

  it('Should encode "integer" type', async () => {
    const dt = api.getSimpleType('integer');
    expect(dt.encode('123', {coerce: true})).toStrictEqual(123);
    expect(dt.encode(123)).toStrictEqual(123);
  })

  it('Should decode "number" type', async () => {
    const dt = api.getSimpleType('number');
    expect(dt.decode('123.12', {coerce: true})).toStrictEqual(123.12);
    expect(dt.decode(123.12)).toStrictEqual(123.12);
  })

  it('Should encode "number" type', async () => {
    const dt = api.getSimpleType('number');
    expect(dt.encode('123.12', {coerce: true})).toStrictEqual(123.12);
    expect(dt.encode(123.12)).toStrictEqual(123.12);
  })

  it('Should decode "string" type', async () => {
    const dt = api.getSimpleType('string');
    expect(dt.decode('john')).toStrictEqual('john');
    expect(dt.decode(1, {coerce: true})).toStrictEqual('1');
  })

  it('Should encode "string" type', async () => {
    const dt = api.getSimpleType('string');
    expect(dt.encode('john')).toStrictEqual('john');
    expect(dt.encode(1, {coerce: true})).toStrictEqual('1');
  })

  it('Should decode "time" type', async () => {
    const dt = api.getSimpleType('time');
    expect(dt.decode('10:30:45')).toStrictEqual('10:30:45');
    expect(dt.decode('10:30', {coerce: true})).toStrictEqual('10:30');
  })

  it('Should encode "time" type', async () => {
    const dt = api.getSimpleType('time');
    expect(dt.encode('10:30:45')).toStrictEqual('10:30:45');
    expect(dt.encode('10:30:00')).toStrictEqual('10:30:00');
  })

  it('Should decode "datetime" type', async () => {
    const dt = api.getSimpleType('datetime');
    expect(dt.decode('2020-01-02T10:30:45', {coerce: true})).toStrictEqual(new Date('2020-01-02T10:30:45'));
    expect(dt.decode('2020-01-02', {coerce: true})).toStrictEqual(new Date('2020-01-02T00:00:00'));
    expect(dt.decode('2020', {coerce: true})).toStrictEqual(new Date('2020-01-01T00:00:00'));
    expect(dt.decode('2020-01-02T10:30:00', {coerce: true})).toStrictEqual(new Date('2020-01-02T10:30:00'));
  })

  it('Should encode "datetime" type', async () => {
    const dt = api.getSimpleType('datetime');
    expect(dt.encode(new Date('2020-01-02T10:30:45'))).toStrictEqual('2020-01-02T10:30:45');
  })

  it('Should decode "approxdate" type', async () => {
    const dt = api.getSimpleType('approxdate');
    expect(dt.decode('2020-01-02T10:30:45', {coerce: true})).toStrictEqual('2020-01-02');
    expect(dt.decode('2020-01-02', {coerce: true})).toStrictEqual('2020-01-02');
    expect(dt.decode('2020-01', {coerce: true})).toStrictEqual('2020-01');
    expect(dt.decode('2020', {coerce: true})).toStrictEqual('2020');
  })

  it('Should encode "approxdate" type', async () => {
    const dt = api.getSimpleType('approxdate');
    expect(dt.encode('2020-01-02T10:30:45', {coerce: true})).toStrictEqual('2020-01-02');
    expect(dt.encode('2020-01-02', {coerce: true})).toStrictEqual('2020-01-02');
    expect(dt.encode('2020-01', {coerce: true})).toStrictEqual('2020-01');
    expect(dt.encode('2020', {coerce: true})).toStrictEqual('2020');
  })

  it('Should decode "approxdatetime" type', async () => {
    const dt = api.getSimpleType('approxdatetime');
    expect(dt.decode('2020-01-02T23:48:12+01:00', {coerce: true})).toStrictEqual('2020-01-02T23:48:12+01:00');
    expect(dt.decode('2020-01-02T23:48:12', {coerce: true})).toStrictEqual('2020-01-02T23:48:12');
    expect(dt.decode('2020-01-02', {coerce: true})).toStrictEqual('2020-01-02');
    expect(dt.decode('2020-01', {coerce: true})).toStrictEqual('2020-01');
    expect(dt.decode('2020', {coerce: true})).toStrictEqual('2020');
  })

  it('Should encode "approxdatetime" type', async () => {
    const dt = api.getSimpleType('approxdatetime');
    expect(dt.encode('2020-01-02T23:48:12+01:00', {coerce: true})).toStrictEqual('2020-01-02T23:48:12+01:00');
    expect(dt.encode('2020-01-02T23:48:12', {coerce: true})).toStrictEqual('2020-01-02T23:48:12');
    expect(dt.encode('2020-01-02', {coerce: true})).toStrictEqual('2020-01-02');
    expect(dt.encode('2020-01', {coerce: true})).toStrictEqual('2020-01');
    expect(dt.encode('2020', {coerce: true})).toStrictEqual('2020');
  })

});
