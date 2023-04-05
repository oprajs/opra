import 'reflect-metadata';
import { METADATA_KEY, SimpleType } from '@opra/common';

describe('SimpleType() decorator', function () {

  it('Should define SimpleType metadata', async function () {
    const opts: SimpleType.DecoratorOptions = {
      description: 'Custom string schema'
    }

    @SimpleType(opts)
    class CustomStringType {

    }

    const schema = Reflect.getMetadata(METADATA_KEY, CustomStringType);
    expect(schema).toStrictEqual({kind: 'SimpleType', name: 'customString', ...opts});
  })

  it('Should set alternate name', async () => {

    @SimpleType({description: 'Custom string schema', name: 'myString'})
    class CustomStringType {

    }

    const schema = Reflect.getMetadata(METADATA_KEY, CustomStringType);
    expect(schema.name).toStrictEqual('myString');
  })

  it('Should not overwrite while extending', async () => {

    @SimpleType({description: 'Custom string schema'})
    class CustomStringType {
      id: string;
    }

    @SimpleType()
    class MyStringType extends CustomStringType {
      name: string;
    }

    const sch1 = Reflect.getMetadata(METADATA_KEY, CustomStringType);
    const sch2 = Reflect.getMetadata(METADATA_KEY, MyStringType);
    expect(sch1.name).toStrictEqual('customString');
    expect(sch2.name).toStrictEqual('myString');
  })

});

