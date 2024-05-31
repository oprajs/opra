import 'reflect-metadata';
import { DATATYPE_METADATA, SimpleType } from '@opra/common';
import { StringType } from '@opra/common/document/data-type/primitive-types/index';

describe('SimpleType() decorator', function () {
  afterAll(() => global.gc && global.gc());

  it('Should define SimpleType metadata', async function () {
    const opts: SimpleType.Options = {
      description: 'Custom string schema',
    };

    @SimpleType(opts)
    class CustomStringType extends StringType {}

    const schema = Reflect.getMetadata(DATATYPE_METADATA, CustomStringType);
    expect(schema).toStrictEqual({ kind: 'SimpleType', name: 'customString', ...opts });
  });

  it('Should set alternate name', async () => {
    @SimpleType({ description: 'Custom string schema', name: 'myString' })
    class CustomStringType extends StringType {}

    const schema = Reflect.getMetadata(DATATYPE_METADATA, CustomStringType);
    expect(schema.name).toStrictEqual('myString');
  });

  it('Should not overwrite while extending', async () => {
    @SimpleType({ description: 'Custom string schema' })
    class CustomStringType extends StringType {}

    @SimpleType()
    class MyStringType extends CustomStringType {}

    const sch1 = Reflect.getMetadata(DATATYPE_METADATA, CustomStringType);
    const sch2 = Reflect.getMetadata(DATATYPE_METADATA, MyStringType);
    expect(sch1.name).toStrictEqual('customString');
    expect(sch2.name).toStrictEqual('myString');
  });
});
