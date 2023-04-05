/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '@opra/sqb'
import {
  ComplexType,
  DocumentFactory,
  Expose,
  OpraSchema,
  SimpleType
} from '@opra/common';
import { Column, DataType } from '@sqb/connect';

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
      additionalElements: true,
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
    expect(t.additionalElements).toEqual(true);
  })

  it('Should define elements', async () => {
    @ComplexType({
      description: 'test type',
      abstract: true,
      additionalElements: true,
    })
    class Type1 {
      @Expose()
      id: number
      @Expose({type: 'guid'})
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
    expect(t.elements.get('id')).toBeDefined();
    expect(t.elements.get('id')?.type.name).toStrictEqual('number');
    expect(t.elements.get('cid')).toBeDefined();
    expect(t.elements.get('cid')?.type.name).toStrictEqual('guid');
  })

  it('Should define elements by element schema object', async () => {
    @ComplexType({
      description: 'test type',
      abstract: true,
      additionalElements: true,
    })
    class Type1 {
      @Expose({
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
    expect(t.elements.get('cid')).toBeDefined();
    expect(t.elements.get('cid')?.type.isAnonymous).toStrictEqual(true);
    expect((t.elements.get('cid')?.type as SimpleType).base?.name).toStrictEqual('string');
  })

  it('Should extend ComplexType', async () => {
    @ComplexType({
      description: 'test type',
      abstract: true,
      additionalElements: true,
    })
    class Type1 {
      @Expose()
      id: number
    }

    @ComplexType({
      description: 'test type 2',
    })
    class Type2 extends Type1 {
      @Expose({type: 'guid'})
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
    expect(t.elements.get('id')).toBeDefined();
    expect(t.elements.get('id')?.type.name).toStrictEqual('number');
    expect(t.elements.get('cid')).toBeDefined();
    expect(t.elements.get('cid')?.type.name).toStrictEqual('guid');
  })

  it('Should get elements info from SQB', async () => {
    @ComplexType({
      description: 'test type',
      abstract: true,
      additionalElements: true,
    })
    class Type1 {
      @Expose()
      @Column({dataType: DataType.INTEGER, notNull: true, default: 1, exclusive: true})
      id: number
      @Expose()
      @Column({dataType: DataType.GUID})
      cid: string
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
    expect(Array.from(t.elements.keys())).toStrictEqual(['id', 'cid']);
    expect(t.elements.get('id')).toBeDefined();
    expect(t.elements.get('id')?.type.name).toStrictEqual('integer');
    expect(t.elements.get('id')?.required).toStrictEqual(true);
    expect(t.elements.get('id')?.default).toStrictEqual(1);
    expect(t.elements.get('id')?.exclusive).toStrictEqual(true);
    expect(t.elements.get('cid')).toBeDefined();
    expect(t.elements.get('cid')?.type.name).toStrictEqual('guid');
  })

})

