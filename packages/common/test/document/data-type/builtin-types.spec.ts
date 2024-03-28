/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument,
  ApiDocumentFactory,
  OpraSchema,
} from '@opra/common';

describe('Built-in types', function () {
  let api: ApiDocument;
  const baseArgs: ApiDocumentFactory.InitArguments = {
    spec: OpraSchema.SpecVersion,
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
    expect(dt).toBeDefined();
    const decode = dt.generateCodec('decode');
    expect(decode('t')).toStrictEqual('t');
    expect(decode(1)).toStrictEqual(1);
  })

  it('Should encode "any" type', async () => {
    const dt = api.getSimpleType('any');
    const encode = dt.generateCodec('encode');
    expect(encode('t')).toStrictEqual('t');
    expect(encode(1)).toStrictEqual(1);
  })

  it('Should decode "base64" type', async () => {
    const dt = api.getSimpleType('base64');
    const decode = dt.generateCodec('decode');
    expect(decode('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n')).toStrictEqual('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n');
  })

  it('Should encode "base64" type', async () => {
    const dt = api.getSimpleType('base64');
    const encode = dt.generateCodec('encode');
    expect(encode('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n')).toStrictEqual('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n');
  })

  it('Should decode "boolean" type', async () => {
    const dt = api.getSimpleType('boolean');
    const decode = dt.generateCodec('decode');
    expect(decode('t', {coerce: true})).toStrictEqual(true);
    expect(decode(true)).toStrictEqual(true);
    expect(decode(false)).toStrictEqual(false);
  })

  it('Should encode "boolean" type', async () => {
    const dt = api.getSimpleType('boolean');
    const encode = dt.generateCodec('encode');
    expect(encode('t', {coerce: true})).toStrictEqual(true);
    expect(encode(true)).toStrictEqual(true);
    expect(encode(false)).toStrictEqual(false);
  })

  it('Should decode "date" type', async () => {
    const dt = api.getSimpleType('date');
    const decode = dt.generateCodec('decode');
    expect(decode('2020-01-02T10:30:00', {coerce: true})).toStrictEqual(new Date('2020-01-02T00:00:00'));
    expect(decode('2020-01-02', {coerce: true})).toStrictEqual(new Date('2020-01-02T00:00:00'));
    expect(decode('2020', {coerce: true})).toStrictEqual(new Date('2020-01-01T00:00:00'));
    expect(decode('2020-01-02T10:30:00', {coerce: true})).toStrictEqual(new Date('2020-01-02T00:00:00'));
  })

  it('Should encode "date" type', async () => {
    const dt = api.getSimpleType('date');
    const encode = dt.generateCodec('encode');
    expect(encode(new Date('2020-01-02T00:00:00'))).toStrictEqual('2020-01-02');
  })

  it('Should decode "integer" type', async () => {
    const dt = api.getSimpleType('integer');
    const decode = dt.generateCodec('decode');
    expect(decode('123', {coerce: true})).toStrictEqual(123);
    expect(decode(123)).toStrictEqual(123);
  })

  it('Should encode "integer" type', async () => {
    const dt = api.getSimpleType('integer');
    const encode = dt.generateCodec('encode');
    expect(encode('123', {coerce: true})).toStrictEqual(123);
    expect(encode(123)).toStrictEqual(123);
  })

  it('Should decode "number" type', async () => {
    const dt = api.getSimpleType('number');
    const decode = dt.generateCodec('decode');
    expect(decode('123.12', {coerce: true})).toStrictEqual(123.12);
    expect(decode(123.12)).toStrictEqual(123.12);
  })

  it('Should encode "number" type', async () => {
    const dt = api.getSimpleType('number');
    const encode = dt.generateCodec('encode');
    expect(encode('123.12', {coerce: true})).toStrictEqual(123.12);
    expect(encode(123.12)).toStrictEqual(123.12);
  })

  it('Should decode "string" type', async () => {
    const dt = api.getSimpleType('string');
    const decode = dt.generateCodec('decode');
    expect(decode('john')).toStrictEqual('john');
    expect(decode(1, {coerce: true})).toStrictEqual('1');
  })

  it('Should encode "string" type', async () => {
    const dt = api.getSimpleType('string');
    const encode = dt.generateCodec('encode');
    expect(encode('john')).toStrictEqual('john');
    expect(encode(1, {coerce: true})).toStrictEqual('1');
  })

  it('Should decode "time" type', async () => {
    const dt = api.getSimpleType('time');
    const decode = dt.generateCodec('decode');
    expect(decode('10:30:45')).toStrictEqual('10:30:45');
    expect(decode('10:30', {coerce: true})).toStrictEqual('10:30');
  })

  it('Should encode "time" type', async () => {
    const dt = api.getSimpleType('time');
    const encode = dt.generateCodec('encode');
    expect(encode('10:30:45')).toStrictEqual('10:30:45');
    expect(encode('10:30:00')).toStrictEqual('10:30:00');
  })

  it('Should decode "datetime" type', async () => {
    const dt = api.getSimpleType('datetime');
    const decode = dt.generateCodec('decode');
    expect(decode('2020-01-02T10:30:45', {coerce: true})).toStrictEqual(new Date('2020-01-02T10:30:45'));
    expect(decode('2020-01-02', {coerce: true})).toStrictEqual(new Date('2020-01-02T00:00:00'));
    expect(decode('2020', {coerce: true})).toStrictEqual(new Date('2020-01-01T00:00:00'));
    expect(decode('2020-01-02T10:30:00', {coerce: true})).toStrictEqual(new Date('2020-01-02T10:30:00'));
  })

  it('Should encode "datetime" type', async () => {
    const dt = api.getSimpleType('datetime');
    const encode = dt.generateCodec('encode');
    expect(encode(new Date('2020-01-02T10:30:45'))).toStrictEqual('2020-01-02T10:30:45');
  })

  it('Should decode "approxdate" type', async () => {
    const dt = api.getSimpleType('approxdate');
    const decode = dt.generateCodec('decode');
    expect(decode('2020-01-02T10:30:45', {coerce: true})).toStrictEqual('2020-01-02');
    expect(decode('2020-01-02', {coerce: true})).toStrictEqual('2020-01-02');
    expect(decode('2020-01', {coerce: true})).toStrictEqual('2020-01');
    expect(decode('2020', {coerce: true})).toStrictEqual('2020');
  })

  it('Should encode "approxdate" type', async () => {
    const dt = api.getSimpleType('approxdate');
    const encode = dt.generateCodec('encode');
    expect(encode('2020-01-02T10:30:45', {coerce: true})).toStrictEqual('2020-01-02');
    expect(encode('2020-01-02', {coerce: true})).toStrictEqual('2020-01-02');
    expect(encode('2020-01', {coerce: true})).toStrictEqual('2020-01');
    expect(encode('2020', {coerce: true})).toStrictEqual('2020');
  })

  it('Should decode "approxdatetime" type', async () => {
    const dt = api.getSimpleType('approxdatetime');
    const decode = dt.generateCodec('decode');
    expect(decode('2020-01-02T23:48:12+01:00', {coerce: true})).toStrictEqual('2020-01-02T23:48:12+01:00');
    expect(decode('2020-01-02T23:48:12', {coerce: true})).toStrictEqual('2020-01-02T23:48:12');
    expect(decode('2020-01-02', {coerce: true})).toStrictEqual('2020-01-02');
    expect(decode('2020-01', {coerce: true})).toStrictEqual('2020-01');
    expect(decode('2020', {coerce: true})).toStrictEqual('2020');
  })

  it('Should encode "approxdatetime" type', async () => {
    const dt = api.getSimpleType('approxdatetime');
    const encode = dt.generateCodec('encode');
    expect(encode('2020-01-02T23:48:12+01:00', {coerce: true})).toStrictEqual('2020-01-02T23:48:12+01:00');
    expect(encode('2020-01-02T23:48:12', {coerce: true})).toStrictEqual('2020-01-02T23:48:12');
    expect(encode('2020-01-02', {coerce: true})).toStrictEqual('2020-01-02');
    expect(encode('2020-01', {coerce: true})).toStrictEqual('2020-01');
    expect(encode('2020', {coerce: true})).toStrictEqual('2020');
  })

});
