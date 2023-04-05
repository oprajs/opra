/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '@opra/sqb'
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
    @SimpleType({ctor: Number})
    class Type1 {
      decode() {
        return 1;
      }

      encode() {
        return 2;
      }
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
    expect(t.decode).toEqual(Type1.prototype.decode);
    expect(t.encode).toEqual(Type1.prototype.encode);
  })

  it('Should extend SimpleType', async () => {
    @SimpleType({ctor: Number})
    class Type2 {
      decode() {
        return 1;
      }

      encode() {
        return 2;
      }
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
    expect(t.decode).toEqual(t.base?.decode);
    expect(t.encode).toEqual(t.base?.encode);
  })

})

