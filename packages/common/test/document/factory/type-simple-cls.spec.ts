/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  DocumentFactory,
  OpraSchema,
  SimpleType
} from '@opra/common';

describe('DocumentFactory - SimpleType with decorated classes', function () {

  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  it('Should add SimpleType by decorated class', async () => {
    @SimpleType()
    class Type1  {
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: [Type1]
    })
    expect(doc).toBeDefined();
    expect(doc.types.get('type1')).toBeDefined();
    const t = doc.types.get('type1') as SimpleType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('SimpleType');
    expect(t.name).toStrictEqual('type1');
  })

  it('Should extend SimpleType', async () => {
    @SimpleType()
    class Type2 {
    }

    @SimpleType()
    class Type1 extends Type2 {
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: [Type1]
    })
    expect(doc).toBeDefined();
    expect(Array.from(doc.types.keys())).toStrictEqual(['type1', 'type2']);
    const t = doc.types.get('type1') as SimpleType;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual('SimpleType');
    expect(t.name).toStrictEqual('type1');
    expect(t.base).toBeDefined();
    expect(t.base?.name).toStrictEqual('type2');
  })

})

