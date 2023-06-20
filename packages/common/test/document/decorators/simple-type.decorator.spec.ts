import 'reflect-metadata';
import { METADATA_KEY, SimpleType } from '@opra/common';
import { StringType } from '../../../src/document/data-type/builtin/index.js';

describe('SimpleType() decorator', function () {

  it('Should define SimpleType metadata', async function () {
    const opts: SimpleType.DecoratorOptions = {
      description: 'Custom string schema'
    }

    @SimpleType(opts)
    class CustomStringType extends StringType {
    }

    const schema = Reflect.getMetadata(METADATA_KEY, CustomStringType);
    expect(schema).toStrictEqual({kind: 'SimpleType', name: 'customString', ...opts});
  })

  it('Should set alternate name', async () => {

    @SimpleType({description: 'Custom string schema', name: 'myString'})
    class CustomStringType extends StringType {

    }

    const schema = Reflect.getMetadata(METADATA_KEY, CustomStringType);
    expect(schema.name).toStrictEqual('myString');
  })

  it('Should not overwrite while extending', async () => {

    @SimpleType({description: 'Custom string schema'})
    class CustomStringType extends StringType {

    }

    @SimpleType()
    class MyStringType extends CustomStringType {
    }

    const sch1 = Reflect.getMetadata(METADATA_KEY, CustomStringType);
    const sch2 = Reflect.getMetadata(METADATA_KEY, MyStringType);
    expect(sch1.name).toStrictEqual('customString');
    expect(sch2.name).toStrictEqual('myString');
  })

});

