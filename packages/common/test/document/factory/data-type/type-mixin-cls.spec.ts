/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  ApiField,
  ComplexType,
  MixinType,
  OpraSchema
} from '@opra/common';

describe('ApiDocumentFactory - MixinType with decorated classes', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    spec: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should add MixinType', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      id: number
    }

    @ComplexType()
    class Type2 {
      @ApiField()
      name: string
    }

    @ComplexType({
      additionalFields: true
    })
    class Type3 {
      @ApiField()
      age: number
    }

    @ComplexType()
    class Mixin1 extends MixinType(Type1, MixinType(Type2, Type3)) {

    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Type1, Type2, Type3, Mixin1]
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('mixin1') as MixinType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Mixin1');
    expect(t1.additionalFields).toStrictEqual(true);
    expect(Array.from(t1.fields.keys())).toStrictEqual(['id', 'name', 'age']);
  })

})

