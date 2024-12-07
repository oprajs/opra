import {
  ApiDocumentFactory,
  ApiField,
  ComplexType,
  MixinType,
} from '@opra/common';

describe('DataTypeFactory - MixinType (Class)', () => {
  afterAll(() => global.gc && global.gc());

  it('Should import MixinType', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      declare id: number;
    }

    @ComplexType()
    class Type2 {
      @ApiField()
      declare name: string;
    }

    @ComplexType({
      additionalFields: true,
    })
    class Type3 {
      @ApiField()
      declare age: number;
    }

    @ComplexType()
    class Mixed1 extends MixinType(Type1, MixinType(Type2, Type3)) {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1, Type2, Type3, Mixed1],
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getComplexType('mixed1');
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Mixed1');
    expect(t1.additionalFields).toStrictEqual(true);
    expect(Array.from(t1.fields.keys())).toStrictEqual(['id', 'name', 'age']);
  });
});
