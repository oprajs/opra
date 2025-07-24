import 'reflect-metadata';
import {
  ApiDocument,
  ApiDocumentFactory,
  ApiField,
  ComplexType,
  OpraSchema,
  UnionType,
} from '@opra/common';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../_support/test-http-api/index.js';

describe('common:UnionType', () => {
  let doc: ApiDocument;

  before(async () => {
    const baseDoc = await TestHttpApiDocument.create();
    doc = await ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      references: {
        base: baseDoc,
      },
      types: [
        Dog,
        Cat,
        UnionType([Dog, Cat], { name: 'UnionType1' }),
        UnionType([Dog, Cat, 'string'], { name: 'UnionType2' }),
      ],
    });
  });

  it('Should create UnionType', async () => {
    const dt = doc.node.getUnionType('UnionType2');
    expect(dt).toBeDefined();
    expect(dt.name).toEqual('UnionType2');
    expect(dt.types.length).toEqual(3);
    expect(dt.types[0].name).toEqual('Dog');
    expect(dt.types[1].name).toEqual('Cat');
    expect(dt.types[2].name).toEqual('string');
  });

  it('Should _generateSchema() return ValGen schema', async () => {
    const dt = doc.node.getUnionType('UnionType2');
    const decode = dt.generateCodec('decode', {});
    let v = decode({ kind: 'dog', name: 'Daisy' });
    expect(v).toBeInstanceOf(Dog);
    v = decode({ kind: 'cat', name: 'Kitty' });
    expect(v).toBeInstanceOf(Cat);
    v = decode('Kitty');
    expect(v).toEqual('Kitty');
  });
});

@ComplexType({
  discriminatorField: 'kind',
  discriminatorValue: 'dog',
})
class Dog {
  @ApiField()
  declare kind: string;
  @ApiField()
  declare name: string;
}

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
