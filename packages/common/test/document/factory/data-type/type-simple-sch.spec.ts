/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  OpraSchema,
  SimpleType,
} from '@opra/common';

describe('ApiDocumentFactory - SimpleType with schema object', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    spec: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should add SimpleType by type schema', async () => {
    const type1: OpraSchema.SimpleType = {
      kind: 'SimpleType',
      description: 'test type'
    };
    const doc = await ApiDocumentFactory.createDocument({
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
  })

  it('Should extend SimpleType from other type by name', async () => {
    const type1: OpraSchema.SimpleType = {
      kind: 'SimpleType',
      base: 'type2'
    };
    const type2: OpraSchema.SimpleType = {
      kind: 'SimpleType',
      description: 'test type',
    };
    const doc = await ApiDocumentFactory.createDocument({
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
  })

  it('Should detect circular references', async () => {
    const type1: OpraSchema.SimpleType = {
      kind: 'SimpleType',
      base: 'type1'
    };
    await expect(() => ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: {
        type1
      }
    })).rejects.toThrow('Circular reference detected')
  })

});
