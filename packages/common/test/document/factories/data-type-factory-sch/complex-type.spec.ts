import { ApiDocumentFactory, ApiField, OpraSchema } from '@opra/common';

describe('DataTypeFactory - ComplexType (Schema)', () => {
  afterAll(() => global.gc && global.gc());

  it('Should import ComplexType', async () => {
    const type1: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      description: 'test type',
      abstract: true,
      additionalFields: true,
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: {
        type1,
      },
    });
    expect(doc).toBeDefined();
    const t = doc.node.getComplexType('type1');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.ComplexType.Kind);
    expect(t.name).toStrictEqual('type1');
    expect(t.description).toEqual(type1.description);
    expect(t.abstract).toEqual(type1.abstract);
    expect(t.additionalFields).toEqual(type1.additionalFields);
  });

  it('Should define fields by type name', async () => {
    const doc = await ApiDocumentFactory.createDocument({
      types: {
        type1: {
          kind: 'ComplexType',
          fields: {
            id: 'string',
          },
        },
      },
    });
    expect(doc).toBeDefined();
    const t = doc.node.getComplexType('type1');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.ComplexType.Kind);
    expect(t.name).toStrictEqual('type1');
    expect(t.findField('id')).toBeDefined();
    expect(t.getField('id')?.type.name).toStrictEqual('string');
  });

  it('Should define fields by schema object', async () => {
    const id: OpraSchema.Field = {
      type: 'string',
      isArray: false,
      isNestedEntity: false,
      description: 'id field',
      default: 'x',
      deprecated: false,
      exclusive: true,
      fixed: 'x',
      required: true,
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: {
        type1: {
          kind: 'ComplexType',
          fields: {
            id,
          },
        },
      },
    });
    expect(doc).toBeDefined();
    const t = doc.node.getComplexType('type1');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.ComplexType.Kind);
    expect(t.name).toStrictEqual('type1');
    const idEl = t.findField('id') as ApiField;
    expect(idEl).toBeDefined();
    expect(idEl.type.name).toStrictEqual('string');
    expect(idEl.isArray).toStrictEqual(id.isArray);
    expect(idEl.isNestedEntity).toStrictEqual(id.isNestedEntity);
    expect(idEl.description).toStrictEqual(id.description);
    expect(idEl.default).toStrictEqual(id.default);
    expect(idEl.deprecated).toStrictEqual(id.deprecated);
    expect(idEl.exclusive).toStrictEqual(id.exclusive);
    expect(idEl.fixed).toStrictEqual(id.fixed);
    expect(idEl.required).toStrictEqual(id.required);
  });

  it('Should extend ComplexType from other ComplexType type by name', async () => {
    class Type2 {}

    const type1: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      base: 'type2',
      fields: {
        name: 'string',
      },
    };
    const type2: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      additionalFields: true,
      ctor: Type2,
      fields: {
        id: 'number',
      },
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: {
        type1,
        type2,
      },
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getComplexType('type1');
    const t2 = doc.node.getComplexType('type2');
    expect(t1).toBeDefined();
    expect(t2).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.ComplexType.Kind);
    expect(t1.name).toStrictEqual('type1');
    expect(t1.additionalFields).toStrictEqual(true);
    expect(t1.ctor).toStrictEqual(Type2);
    expect(Array.from(t1.fieldNames())).toStrictEqual(['id', 'name']);
    const f = t1.findField('id');
    expect(f).toBeDefined();
    expect(f!.origin).toEqual(t2);
    expect(f!.owner).toEqual(t1);
  });

  it('Should extend ComplexType from other ComplexType type in place schema', async () => {
    class Type2 {}

    const type1: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      base: {
        kind: 'ComplexType',
        additionalFields: true,
        ctor: Type2,
        fields: {
          id: 'number',
        },
      },
      fields: {
        name: 'string',
      },
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: {
        type1,
      },
    });
    expect(doc).toBeDefined();
    const t1 = doc.node.getComplexType('type1');
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.ComplexType.Kind);
    expect(t1.name).toStrictEqual('type1');
    expect(t1.additionalFields).toStrictEqual(true);
    expect(t1.ctor).toStrictEqual(Type2);
    expect(Array.from(t1.fieldNames())).toStrictEqual(['id', 'name']);
    expect(t1.getField('id')?.origin).not.toEqual(t1);
    expect(t1.getField('id')?.owner).toEqual(t1);
  });

  it('Should detect circular references', async () => {
    const type1: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      base: 'type1',
      fields: {
        name: 'string',
      },
    };
    await expect(() =>
      ApiDocumentFactory.createDocument({
        types: {
          type1,
        },
      }),
    ).rejects.toThrow('Circular reference detected');
  });
});
