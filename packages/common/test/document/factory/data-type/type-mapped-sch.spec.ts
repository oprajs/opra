/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  MappedType,
  OpraSchema,
} from '@opra/common';

describe('ApiDocumentFactory - MappedType with schema object', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    spec: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should MappedType(pick) extend given ComplexType and pick given fields only', async () => {
    const type1: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      fields: {
        id: 'number',
        name: 'string',
        age: 'number',
        gender: 'string',
      }
    };
    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: {
        mapped1: {
          kind: 'MappedType',
          base: 'type1',
          pick: ['id', 'name']
        },
        type1
      }
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('mapped1') as MappedType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.MappedType.Kind);
    expect(t1.name).toStrictEqual('mapped1');
    expect(t1.base).toBeDefined();
    expect(t1.base.name).toStrictEqual('type1');
    expect(t1.pick).toStrictEqual(['id', 'name']);
    expect(Array.from(t1.fields.keys())).toStrictEqual(['id', 'name']);
  })

  it('Should MappedType(omit) extend given ComplexType and omit given fields', async () => {
    const type1: OpraSchema.ComplexType = {
      kind: 'ComplexType',
      fields: {
        id: 'number',
        name: 'string',
        age: 'number',
        gender: 'string',
      }
    };
    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: {
        mapped1: {
          kind: 'MappedType',
          base: 'type1',
          omit: ['gender', 'age']
        },
        type1
      }
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('mapped1') as MappedType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual(OpraSchema.MappedType.Kind);
    expect(t1.name).toStrictEqual('mapped1');
    expect(t1.base).toBeDefined();
    expect(t1.base.name).toStrictEqual('type1');
    expect(t1.omit).toStrictEqual(['gender', 'age']);
    expect(Array.from(t1.fields.keys())).toStrictEqual(['id', 'name']);
  })

});
