import { ApiDocumentFactory, MixinType, OpraSchema } from '@opra/common';
import { expect } from 'expect';

describe('common:DataTypeFactory - MixinType (Schema)', () => {
  it('Should import MixinType', async () => {
    const type1: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      fields: {
        id: 'number',
      },
    };
    const type2: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      fields: {
        name: 'string',
      },
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: {
        mixin1: {
          kind: 'MixinType',
          types: [
            'type1',
            {
              kind: 'MixinType',
              types: [
                type2,
                {
                  kind: 'ComplexType',
                  additionalFields: true,
                  fields: {
                    age: 'number',
                  },
                },
              ],
            },
          ],
        },
        type1,
      },
    });
    expect(doc).toBeDefined();
    const t1 = doc.types.get('mixin1') as MixinType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.MixinType.Kind);
    expect(t1.name).toStrictEqual('mixin1');
    expect(t1.additionalFields).toStrictEqual(true);
    expect(Array.from(t1.fieldNames())).toStrictEqual(['id', 'name', 'age']);
  });
});
