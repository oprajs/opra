import 'reflect-metadata';
import { DATATYPE_METADATA, SimpleType } from '@opra/common';
import { StringType } from '@opra/common/document/data-type/primitive-types/index';

describe('SimpleType() decorator', () => {
  afterAll(() => global.gc && global.gc());

  it('Should define SimpleType metadata', async () => {
    const opts: SimpleType.Options = {
      name: 'customstring',
      description: 'Custom string schema',
    };

    @SimpleType(opts)
    class CustomStringType extends StringType {}

    const schema = Reflect.getMetadata(DATATYPE_METADATA, CustomStringType);
    expect(schema).toStrictEqual({
      kind: 'SimpleType',
      name: 'customstring',
      ...opts,
    });
  });

  it('Should set alternate name', async () => {
    @SimpleType({ description: 'Custom string schema', name: 'myString' })
    class CustomStringType extends StringType {}

    const schema = Reflect.getMetadata(DATATYPE_METADATA, CustomStringType);
    expect(schema.name).toStrictEqual('myString');
  });

  it('Should not overwrite while extending', async () => {
    @SimpleType({ description: 'Custom string schema' })
    class CustomString extends StringType {}

    @SimpleType()
    class MyString extends CustomString {}

    const sch1 = Reflect.getMetadata(DATATYPE_METADATA, CustomString);
    const sch2 = Reflect.getMetadata(DATATYPE_METADATA, MyString);
    expect(sch1.name).toStrictEqual('customstring');
    expect(sch2.name).toStrictEqual('mystring');
  });
});
