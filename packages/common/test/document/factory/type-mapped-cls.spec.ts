/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '@opra/sqb'
import {
  ComplexType,
  DocumentFactory,
  Expose,
  OmitType,
  OpraSchema,
  PickType,
  UnionType
} from '@opra/common';

describe('DocumentFactory - MappedType with decorated classes', function () {

  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };


  it('Should PickType() create new MappedType with "pick" option', async () => {
    @ComplexType({
      additionalElements: true
    })
    class Type1 {
      @Expose()
      id: number;
      @Expose()
      name: string;
      @Expose()
      age: number;
      @Expose()
      gender: string;
    }

    @ComplexType()
    class Mapped1 extends PickType(Type1, ['id', 'name']) {
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: [Mapped1]
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('mapped1') as UnionType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Mapped1');
    expect(t1.additionalElements).toStrictEqual(true);
    expect(Array.from(t1.elements.keys())).toStrictEqual(['id', 'name']);
  })

  it('Should OmitType() create new MappedType with "omit" option', async () => {
    @ComplexType({
      additionalElements: true
    })
    class Type1 {
      @Expose()
      id: number;
      @Expose()
      name: string;
      @Expose()
      age: number;
      @Expose()
      gender: string;
    }

    @ComplexType()
    class Mapped1 extends OmitType(Type1, ['age', 'gender']) {
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: [Mapped1]
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('mapped1') as UnionType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Mapped1');
    expect(t1.additionalElements).toStrictEqual(true);
    expect(Array.from(t1.elements.keys())).toStrictEqual(['id', 'name']);
  })

})

