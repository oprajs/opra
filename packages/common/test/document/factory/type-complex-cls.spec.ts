/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiField,
  ComplexType,
  DocumentFactory,
  OpraSchema,
  SimpleType
} from '@opra/common';

describe('DocumentFactory - ComplexType with decorated classes', function () {

  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };


  it('Should add ComplexType by decorated class', async () => {
    @ComplexType({
      description: 'test type',
      abstract: true,
      additionalFields: true,
    })
    class Type1 {

    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: [Type1]
    })
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.name).toStrictEqual('Type1');
    expect(t.description).toEqual('test type');
    expect(t.abstract).toEqual(true);
    expect(t.additionalFields).toEqual(true);
  })

  it('Should define fields', async () => {
    @ComplexType({
      description: 'test type',
      abstract: true,
      additionalFields: true,
    })
    class Type1 {
      @ApiField()
      id: number
      @ApiField({type: 'uuid'})
      cid: number
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: [Type1]
    })
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.name).toStrictEqual('Type1');
    expect(t.fields.get('id')).toBeDefined();
    expect(t.fields.get('id')?.type.name).toStrictEqual('number');
    expect(t.fields.get('cid')).toBeDefined();
    expect(t.fields.get('cid')?.type.name).toStrictEqual('uuid');
  })

  it('Should define fields by schema object', async () => {
    @ComplexType({
      description: 'test type',
      abstract: true,
      additionalFields: true,
    })
    class Type1 {
      @ApiField({
        type: {
          kind: 'SimpleType',
          base: 'string'
        }
      })
      cid: number
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: [Type1]
    })
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.name).toStrictEqual('Type1');
    expect(t.fields.get('cid')).toBeDefined();
    expect(t.fields.get('cid')?.type.isAnonymous).toStrictEqual(true);
    expect((t.fields.get('cid')?.type as SimpleType).base?.name).toStrictEqual('string');
  })

  it('Should extend ComplexType', async () => {
    @ComplexType({
      description: 'test type',
      abstract: true,
      additionalFields: true,
    })
    class Type1 {
      @ApiField()
      id: number
    }

    @ComplexType({
      description: 'test type 2',
    })
    class Type2 extends Type1 {
      @ApiField({type: 'uuid'})
      cid: number
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: [Type2]
    })
    expect(doc).toBeDefined();
    const t = doc.types.get('type2') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.name).toStrictEqual('Type2');
    expect(t.fields.get('id')).toBeDefined();
    expect(t.fields.get('id')?.type.name).toStrictEqual('number');
    expect(t.fields.get('cid')).toBeDefined();
    expect(t.fields.get('cid')?.type.name).toStrictEqual('uuid');
  })

})

