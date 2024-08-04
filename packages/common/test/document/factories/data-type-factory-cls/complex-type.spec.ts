import { ApiDocument, ApiDocumentFactory, ApiField, ComplexType, OpraSchema } from '@opra/common';

describe('DataTypeFactory - ComplexType (Class)', () => {
  afterAll(() => global.gc && global.gc());

  it('Should import ComplexType', async () => {
    @ComplexType({
      description: 'test type',
      abstract: true,
      additionalFields: true,
    })
    class Type1 {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1],
    });
    expect(doc).toBeDefined();
    expect(doc).toBeInstanceOf(ApiDocument);
    expect(doc.types.size).toBeGreaterThan(0);
    const t = doc.node.getComplexType('type1');
    expect(t).toBeDefined();
    expect(t!.kind).toStrictEqual('ComplexType');
    expect(t!.description).toStrictEqual('test type');
    expect(t!.abstract).toStrictEqual(true);
    expect(t!.additionalFields).toStrictEqual(true);
  });

  it('Should define custom name', async () => {
    @ComplexType({
      name: 'type2',
    })
    class Type1 {}

    const doc = await ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      types: [Type1],
    });
    expect(doc).toBeDefined();
    expect(doc).toBeInstanceOf(ApiDocument);
    expect(doc.types.size).toBeGreaterThan(0);
    const t = doc.node.getComplexType('type2');
    expect(t).toBeDefined();
  });

  it('Should define fields', async () => {
    @ComplexType({
      name: 'type2',
    })
    class Type1 {
      @ApiField()
      declare id: number;
      @ApiField({ type: 'uuid' })
      declare cid: number;
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1],
    });
    expect(doc).toBeDefined();
    expect(doc).toBeInstanceOf(ApiDocument);
    expect(doc.types.size).toBeGreaterThan(0);
    const t = doc.node.getComplexType('type2');
    expect(t).toBeDefined();
    expect(t.fields.size).toEqual(2);
    expect(t.fields.get('id')).toBeDefined();
    expect(t.fields.get('cid')).toBeDefined();
  });

  it('Should extend ComplexType', async () => {
    @ComplexType({
      description: 'test type',
      abstract: true,
      additionalFields: true,
    })
    class Type1 {
      @ApiField()
      declare id: number;
    }

    @ComplexType({
      description: 'test type 2',
    })
    class Type2 extends Type1 {
      @ApiField({ type: 'uuid' })
      declare cid: number;
    }

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2],
    });
    expect(doc).toBeDefined();
    const t = doc.node.getComplexType('type2');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.name).toStrictEqual('Type2');
    expect(t.fields.get('id')).toBeDefined();
    expect(t.fields.get('id')?.type.name).toStrictEqual('number');
    expect(t.fields.get('cid')).toBeDefined();
    expect(t.fields.get('cid')?.type.name).toStrictEqual('uuid');
  });

  it('Should use any data type in "additionalFields"', async () => {
    @ComplexType({ description: 'test type 2' })
    class Type2 {}

    @ComplexType({
      description: 'test type',
      abstract: true,
      additionalFields: Type2,
    })
    class Type1 {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2],
    });
    expect(doc).toBeDefined();
    const t = doc.node.getComplexType('type1');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.name).toStrictEqual('Type1');
    expect(t.description).toEqual('test type');
    expect(t.abstract).toEqual(true);
    expect(t.additionalFields).toBeDefined();
    expect(t.additionalFields).toBeInstanceOf(ComplexType);
  });
});
