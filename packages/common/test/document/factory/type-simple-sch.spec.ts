/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  DocumentFactory,
  OpraSchema,
  SimpleType,
} from '@opra/common';

describe('DocumentFactory - SimpleType with schema object', function () {

  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  it('Should add SimpleType by type schema', async () => {
    const type1: OpraSchema.SimpleType = {
      kind: 'SimpleType',
      description: 'test type',
      codec: {
        decode: () => 1,
        encode: () => 2,
      }
    };
    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: {
        type1
      }
    })
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as SimpleType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.SimpleType.Kind);
    expect(t.name).toStrictEqual('type1');
    expect(t.description).toEqual(type1.description);
    expect(t.decode).toEqual(type1.codec?.decode);
    expect(t.encode).toEqual(type1.codec?.encode);
  })

  it('Should extend SimpleType from other type by name', async () => {
    const type1: OpraSchema.SimpleType = {
      kind: 'SimpleType',
      base: 'type2'
    };
    const type2: OpraSchema.SimpleType = {
      kind: 'SimpleType',
      description: 'test type',
      codec: {
        decode: () => 1,
        encode: () => 2,
      }
    };
    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: {
        type1,
        type2
      }
    })
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as SimpleType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.SimpleType.Kind);
    expect(t.name).toStrictEqual('type1');
    expect(t.base).toBeDefined();
    expect(t.base?.name).toStrictEqual('type2');
    expect(t.decode).toEqual(t.base?.decode);
    expect(t.encode).toEqual(t.base?.encode);
  })

  it('Should extend SimpleType from other type by in place schema', async () => {
    const type1: OpraSchema.SimpleType = {
      kind: 'SimpleType',
      base: {
        kind: 'SimpleType',
        description: 'test type',
        codec: {
          decode: () => 1,
          encode: () => 2,
        }
      }
    };
    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: {
        type1
      }
    })
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as SimpleType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.SimpleType.Kind);
    expect(t.name).toStrictEqual('type1');
    expect(t.base).toBeDefined();
    expect(t.base?.isAnonymous).toStrictEqual(true);
    expect(t.decode).toEqual(t.base?.decode);
    expect(t.encode).toEqual(t.base?.encode);
  });

  it('Should detect circular references', async () => {
    const type1: OpraSchema.SimpleType = {
      kind: 'SimpleType',
      base: 'type1'
    };
    await expect(() => DocumentFactory.createDocument({
      ...baseArgs,
      types: {
        type1
      }
    })).rejects.toThrow('Circular reference detected')
  })

});
