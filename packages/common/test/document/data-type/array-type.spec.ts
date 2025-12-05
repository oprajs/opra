import 'reflect-metadata';
import {
  ApiDocument,
  ApiDocumentFactory,
  ApiField,
  ArrayType,
  ComplexType,
  OpraSchema,
} from '@opra/common';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../_support/test-http-api/index.js';

describe('common:ArrayType', () => {
  let doc: ApiDocument;

  before(async () => {
    const baseDoc = await TestHttpApiDocument.create();
    doc = await ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      references: {
        base: baseDoc,
      },
      types: [
        Cat,
        ArrayType(String, { name: 'ArrayType1' }),
        ArrayType(Cat, { name: 'ArrayType2' }),
        ArrayType(ArrayType(Number), { name: 'ArrayType3' }),
      ],
    });
  });

  it('Should create ArrayType', async () => {
    const dt = doc.node.getArrayType('ArrayType1');
    expect(dt).toBeDefined();
    expect(dt.name).toEqual('ArrayType1');
    expect(dt.type).toBeDefined();
    expect(dt.type.name).toEqual('string');
  });

  it('Should generateCodec() return ValGen validator', async () => {
    let dt = doc.node.getArrayType('ArrayType1');
    let decode = dt.generateCodec('decode', {});
    let v = decode(['x', 'y', 2]);
    expect(Array.isArray(v)).toBeTruthy();
    expect(v.length).toEqual(3);
    expect(v).toEqual(['x', 'y', '2']);
    dt = doc.node.getArrayType('ArrayType2');
    decode = dt.generateCodec('decode', {});
    v = decode([{ kind: 'cat', name: 'Daisy' }]);
    expect(Array.isArray(v)).toBeTruthy();
    expect(v.length).toEqual(1);
    expect(v[0]).toBeInstanceOf(Cat);
  });
});

@ComplexType({
  discriminatorField: 'kind',
  discriminatorValue: 'cat',
})
class Cat {
  @ApiField()
  declare kind: string;
  @ApiField()
  declare name: string;
}
