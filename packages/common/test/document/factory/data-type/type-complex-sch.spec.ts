/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  ApiField,
  ComplexType,
  OpraSchema,
} from '@opra/common';

describe('ApiDocumentFactory - ComplexType with schema object', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    spec: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should add ComplexType by type schema', async () => {
    const type1: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      description: 'test type',
      abstract: true,
      additionalFields: true,
    };
    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: {
        type1
      }
    })
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.ComplexType.Kind);
    expect(t.name).toStrictEqual('type1');
    expect(t.description).toEqual(type1.description);
    expect(t.abstract).toEqual(type1.abstract);
    expect(t.additionalFields).toEqual(type1.additionalFields);
  })

  it('Should define fields by type name', async () => {
    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: {
        type1: {
          kind: 'ComplexType',
          fields: {
            id: 'string'
          }
        }
      }
    })
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.ComplexType.Kind);
    expect(t.name).toStrictEqual('type1');
    expect(t.fields.get('id')).toBeDefined();
    expect(t.fields.get('id')?.type.name).toStrictEqual('string');
  })

  it('Should define fields by schema object', async () => {
    const id: OpraSchema.Field = {
      type: 'string',
      isArray: false,
      description: 'id field',
      default: 'x',
      deprecated: false,
      exclusive: true,
      fixed: 'x',
      required: true
    };
    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: {
        type1: {
          kind: 'ComplexType',
          fields: {
            id
          }
        }
      }
    })
    expect(doc).toBeDefined();
    const t = doc.types.get('type1') as ComplexType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.ComplexType.Kind);
    expect(t.name).toStrictEqual('type1');
    const idEl = t.fields.get('id') as ApiField;
    expect(idEl).toBeDefined();
    expect(idEl.type.name).toStrictEqual('string');
    expect(idEl.isArray).toStrictEqual(id.isArray);
    expect(idEl.description).toStrictEqual(id.description);
    expect(idEl.default).toStrictEqual(id.default);
    expect(idEl.deprecated).toStrictEqual(id.deprecated);
    expect(idEl.exclusive).toStrictEqual(id.exclusive);
    expect(idEl.fixed).toStrictEqual(id.fixed);
    expect(idEl.required).toStrictEqual(id.required);
  })

  it('Should extend ComplexType from other ComplexType type by name', async () => {
    class Type2 {
    }

    const type1: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      base: 'type2',
      fields: {
        name: 'string'
      }
    };
    const type2: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      additionalFields: true,
      ctor: Type2,
      fields: {
        id: 'number'
      }
    };
    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: {
        type1,
        type2
      }
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('type1') as ComplexType;
    const t2 = doc.types.get('type2') as ComplexType;
    expect(t1).toBeDefined();
    expect(t2).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.ComplexType.Kind);
    expect(t1.name).toStrictEqual('type1');
    expect(t1.additionalFields).toStrictEqual(true);
    expect(t1.ctor).toStrictEqual(Type2);
    expect(Array.from(t1.fields.keys())).toStrictEqual(['id', 'name']);
    expect(t1.fields.get('id')?.origin).toEqual(t2);
    expect(t1.fields.get('id')?.owner).toEqual(t1);
  })

  it('Should extend ComplexType from other ComplexType type in place schema', async () => {
    class Type2 {
    }

    const type1: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      base: {
        kind: 'ComplexType',
        additionalFields: true,
        ctor: Type2,
        fields: {
          id: 'number'
        }
      },
      fields: {
        name: 'string'
      }
    };
    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: {
        type1
      }
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('type1') as ComplexType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.ComplexType.Kind);
    expect(t1.name).toStrictEqual('type1');
    expect(t1.additionalFields).toStrictEqual(true);
    expect(t1.ctor).toStrictEqual(Type2);
    expect(Array.from(t1.fields.keys())).toStrictEqual(['id', 'name']);
    expect(t1.fields.get('id')?.origin).not.toEqual(t1);
    expect(t1.fields.get('id')?.owner).toEqual(t1);
  })

  it('Should detect circular references', async () => {
    const type1: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      base: 'type1',
      fields: {
        name: 'string'
      }
    };
    await expect(() => ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: {
        type1
      }
    })).rejects.toThrow('Circular reference detected')
  })

});
