import { ApiDocumentFactory, SimpleType, StringType } from '@opra/common';

describe('DataTypeFactory - SimpleType (Class)', () => {
  afterAll(() => global.gc && global.gc());

  it('Should import SimpleType', async () => {
    @SimpleType()
    class Type1 {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1],
    });
    expect(doc).toBeDefined();
    const t = doc.node.getSimpleType('type1');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('SimpleType');
    expect(t.name).toStrictEqual('type1');
  });

  it('Should extend SimpleType', async () => {
    @SimpleType()
    class Type1 extends StringType {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Type1],
    });
    expect(doc).toBeDefined();
    const t = doc.node.getSimpleType('type1');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('SimpleType');
    expect(t.name).toStrictEqual('type1');
    expect(t.base).toBeDefined();
    expect(t.base?.name).toStrictEqual('string');
  });
});
