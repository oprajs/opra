import { ApiDocument } from '@opra/common';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../../_support/test-http-api/index.js';

describe('common:Builtin type: base64', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestHttpApiDocument.create();
  });

  it('Should decode to base64 string when convertToNative=false', async () => {
    const dt = doc.node.getSimpleType('base64');
    const decode = dt.generateCodec('decode');
    expect(decode('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n')).toStrictEqual(
      'dGhpcyBpcyBhIHRlc3Qgc3RyaW5n',
    );
  });

  it('Should decode to Buffer string when convertToNative=true', async () => {
    const dt = doc.node.getSimpleType('base64');
    const decode = dt.generateCodec('decode', null, {
      convertToNative: true,
    });
    const x = decode('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n');
    expect(Buffer.isBuffer(x)).toBeTruthy();
  });

  it('Should encode base64 string', async () => {
    const dt = doc.node.getSimpleType('base64');
    const encode = dt.generateCodec('encode');
    expect(encode('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n')).toStrictEqual(
      'dGhpcyBpcyBhIHRlc3Qgc3RyaW5n',
    );
  });

  it('Should encode Buffer', async () => {
    const dt = doc.node.getSimpleType('base64');
    const encode = dt.generateCodec('encode');
    expect(
      encode(Buffer.from('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n', 'base64')),
    ).toStrictEqual('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n');
  });
});
