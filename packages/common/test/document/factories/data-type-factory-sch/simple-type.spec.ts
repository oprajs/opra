import { ApiDocumentFactory, OpraSchema } from '@opra/common';

describe('DataTypeFactory - SimpleType (Schema)', function () {
  afterAll(() => global.gc && global.gc());

  it('Should import SimpleType', async () => {
    const type1: OpraSchema.SimpleType = {
      kind: 'SimpleType',
      description: 'test type',
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: {
        type1,
      },
    });
    expect(doc).toBeDefined();
    const t = doc.node.getSimpleType('type1');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.SimpleType.Kind);
    expect(t.name).toStrictEqual('type1');
    expect(t.description).toEqual(type1.description);
  });

  it('Should extend SimpleType from other type by name', async () => {
    const type1: OpraSchema.SimpleType = {
      kind: 'SimpleType',
      base: 'type2',
    };
    const type2: OpraSchema.SimpleType = {
      kind: 'SimpleType',
      description: 'test type',
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: {
        type1,
        type2,
      },
    });
    expect(doc).toBeDefined();
    const t = doc.node.getSimpleType('type1');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.SimpleType.Kind);
    expect(t.name).toStrictEqual('type1');
    expect(t.base).toBeDefined();
    expect(t.base?.name).toStrictEqual('type2');
  });

  it('Should detect circular references', async () => {
    const type1: OpraSchema.SimpleType = {
      kind: 'SimpleType',
      base: 'type1',
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
