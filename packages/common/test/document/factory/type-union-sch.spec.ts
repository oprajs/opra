/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  MixinType,
  OpraSchema
} from '@opra/common';

describe('ApiDocumentFactory - MixinType with schema object', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should add MixinType by type schema', async () => {
    const type1: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      fields: {
        id: 'number'
      }
    };
    const type2: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      fields: {
        name: 'string'
      }
    };
    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: {
        mixin1: {
          kind: 'MixinType',
          types: ['type1', {
            kind: 'MixinType',
            types: [type2, {
              kind: 'ComplexType',
              additionalFields: true,
              fields: {
                age: 'number'
              }
            }]
          }]
        },
        type1
      }
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('mixin1') as MixinType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.MixinType.Kind);
    expect(t1.name).toStrictEqual('mixin1');
    expect(t1.additionalFields).toStrictEqual(true);
    expect(Array.from(t1.fields.keys())).toStrictEqual(['id', 'name', 'age']);
  })

});
