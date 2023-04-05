/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '@opra/sqb'
import {
  ComplexType,
  DocumentFactory,
  Expose,
  OpraSchema,
  UnionType
} from '@opra/common';

describe('DocumentFactory - UnionType with decorated classes', function () {

  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  it('Should add UnionType', async () => {
    @ComplexType()
    class Type1 {
      @Expose()
      id: number
    }

    @ComplexType()
    class Type2 {
      @Expose()
      name: string
    }

    @ComplexType({
      additionalElements: true
    })
    class Type3 {
      @Expose()
      age: number
    }

    @ComplexType()
    class Union1 extends UnionType(Type1, UnionType(Type2, Type3)) {

    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: [Union1]
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('union1') as UnionType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Union1');
    expect(t1.additionalElements).toStrictEqual(true);
    expect(Array.from(t1.elements.keys())).toStrictEqual(['id', 'name', 'age']);
  })

})

