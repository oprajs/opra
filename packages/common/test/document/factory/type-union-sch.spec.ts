/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  OpraSchema,
  UnionType
} from '@opra/common';

describe('ApiDocumentFactory - UnionType with schema object', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };


  it('Should add UnionType by type schema', async () => {
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
        union1: {
          kind: 'UnionType',
          types: ['type1', {
            kind: 'UnionType',
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
    const t1 = doc.types.get('union1') as UnionType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.UnionType.Kind);
    expect(t1.name).toStrictEqual('union1');
    expect(t1.additionalFields).toStrictEqual(true);
    expect(Array.from(t1.fields.keys())).toStrictEqual(['id', 'name', 'age']);
  })

});
