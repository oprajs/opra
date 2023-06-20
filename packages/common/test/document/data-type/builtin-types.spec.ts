/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument,
  DocumentFactory,
  OpraSchema,
} from '@opra/common';

describe('Built-in types', function () {
  let api: ApiDocument;
  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
    }
  };

  beforeAll(async () => {
    api = await DocumentFactory.createDocument(baseArgs);
  })

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
    expect(dt.decode('t')).toStrictEqual(true);
    expect(dt.decode(true)).toStrictEqual(true);
    expect(dt.decode(false)).toStrictEqual(false);
  })

  it('Should encode "boolean" type', async () => {
    const dt = api.getSimpleType('boolean');
    expect(dt.encode('t')).toStrictEqual(true);
    expect(dt.encode(true)).toStrictEqual(true);
    expect(dt.encode(false)).toStrictEqual(false);
  })

  it('Should decode "date" type', async () => {
    const dt = api.getSimpleType('date');
    expect(dt.decode('2020-01-02T10:30:00')).toStrictEqual(new Date('2020-01-02T00:00:00'));
    expect(dt.decode('2020-01-02')).toStrictEqual(new Date('2020-01-02T00:00:00'));
    expect(dt.decode('2020')).toStrictEqual(new Date('2020-01-01T00:00:00'));
    expect(dt.decode('2020-01-02T10:30:00')).toStrictEqual(new Date('2020-01-02T00:00:00'));
  })

  it('Should encode "date" type', async () => {
    const dt = api.getSimpleType('date');
    expect(dt.encode(new Date('2020-01-02T00:00:00'))).toStrictEqual('2020-01-02');
  })

  it('Should decode "integer" type', async () => {
    const dt = api.getSimpleType('integer');
    expect(dt.decode('123')).toStrictEqual(123);
    expect(dt.decode(123)).toStrictEqual(123);
  })

  it('Should encode "integer" type', async () => {
    const dt = api.getSimpleType('integer');
    expect(dt.encode('123')).toStrictEqual(123);
    expect(dt.encode(123)).toStrictEqual(123);
  })

  it('Should decode "number" type', async () => {
    const dt = api.getSimpleType('number');
    expect(dt.decode('123.12')).toStrictEqual(123.12);
    expect(dt.decode(123.12)).toStrictEqual(123.12);
  })

  it('Should encode "number" type', async () => {
    const dt = api.getSimpleType('number');
    expect(dt.encode('123.12')).toStrictEqual(123.12);
    expect(dt.encode(123.12)).toStrictEqual(123.12);
  })

  it('Should decode "object" type', async () => {
    const dt = api.getComplexType('object');
    expect(dt.decode({x: 1})).toStrictEqual({x: 1});
  })

  it('Should encode "object" type', async () => {
    const dt = api.getComplexType('object');
    expect(dt.encode({x: 1})).toStrictEqual({x: 1});
  })

  it('Should decode "string" type', async () => {
    const dt = api.getSimpleType('string');
    expect(dt.decode('john')).toStrictEqual('john');
    expect(dt.decode(1)).toStrictEqual('1');
  })

  it('Should encode "string" type', async () => {
    const dt = api.getSimpleType('string');
    expect(dt.encode('john')).toStrictEqual('john');
    expect(dt.encode(1)).toStrictEqual('1');
  })

  it('Should decode "time" type', async () => {
    const dt = api.getSimpleType('time');
    expect(dt.decode('10:30:45')).toStrictEqual('10:30:45');
    expect(dt.decode('10:30')).toStrictEqual('10:30:00');
  })

  it('Should encode "time" type', async () => {
    const dt = api.getSimpleType('time');
    expect(dt.encode('10:30:45')).toStrictEqual('10:30:45');
    expect(dt.encode('10:30:00')).toStrictEqual('10:30:00');
  })

  it('Should decode "timestamp" type', async () => {
    const dt = api.getSimpleType('timestamp');
    expect(dt.decode('2020-01-02T10:30:45')).toStrictEqual(new Date('2020-01-02T10:30:45'));
    expect(dt.decode('2020-01-02')).toStrictEqual(new Date('2020-01-02T00:00:00'));
    expect(dt.decode('2020')).toStrictEqual(new Date('2020-01-01T00:00:00'));
    expect(dt.decode('2020-01-02T10:30:00')).toStrictEqual(new Date('2020-01-02T10:30:00'));
  })

  it('Should encode "timestamp" type', async () => {
    const dt = api.getSimpleType('timestamp');
    expect(dt.encode(new Date('2020-01-02T10:30:45'))).toStrictEqual('2020-01-02T10:30:45');
  })

});
