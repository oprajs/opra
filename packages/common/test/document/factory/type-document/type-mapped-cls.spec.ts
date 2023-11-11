/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  ApiField,
  ComplexType,
  MixinType,
  OmitType,
  OpraSchema,
  PickType
} from '@opra/common';

describe('ApiDocumentFactory - MappedType with decorated classes', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should PickType() create new MappedType with "pick" option', async () => {
    @ComplexType({
      additionalFields: true
    })
    class Type1 {
      @ApiField()
      id: number;
      @ApiField()
      name: string;
      @ApiField()
      age: number;
      @ApiField()
      gender: string;
    }

    @ComplexType()
    class Mapped1 extends PickType(Type1, ['id', 'name']) {
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Mapped1]
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('mapped1') as MixinType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Mapped1');
    expect(t1.additionalFields).toStrictEqual(true);
    expect(Array.from(t1.fields.keys())).toStrictEqual(['id', 'name']);
  })

  it('Should OmitType() create new MappedType with "omit" option', async () => {
    @ComplexType({
      additionalFields: true
    })
    class Type1 {
      @ApiField()
      id: number;
      @ApiField()
      name: string;
      @ApiField()
      age: number;
      @ApiField()
      gender: string;
    }

    @ComplexType()
    class Mapped1 extends OmitType(Type1, ['age', 'gender']) {
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Mapped1]
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('mapped1') as MixinType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Mapped1');
    expect(t1.additionalFields).toStrictEqual(true);
    expect(Array.from(t1.fields.keys())).toStrictEqual(['id', 'name']);
  })

})

