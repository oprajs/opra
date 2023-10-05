import 'reflect-metadata';
import { ComplexType, DATATYPE_METADATA } from '@opra/common';

describe('ComplexType() decorator', function () {

  afterAll(() => global.gc && global.gc());

  it('Should define ComplexType metadata', async function () {
    const opts: ComplexType.DecoratorOptions = {
      description: 'Animal schema',
      abstract: false,
      additionalFields: true
    }

    @ComplexType(opts)
    class Animal {
      id: string;
    }

    const schema = Reflect.getMetadata(DATATYPE_METADATA, Animal);
    expect(schema).toStrictEqual({kind: 'ComplexType', name: 'Animal', ...opts});
  })

  it('Should set alternate name', async () => {

    @ComplexType({description: 'Animal schema', name: 'Cat'})
    class Animal {
      id: string;
    }

    const schema = Reflect.getMetadata(DATATYPE_METADATA, Animal)
    expect(schema.name).toStrictEqual('Cat');
  })

  it('Should not overwrite while extending', async () => {

    @ComplexType({description: 'Animal schema'})
    class Animal {
      id: string;
    }

    @ComplexType()
    class Cat extends Animal {
      name: string;
    }

    const animalSchema = Reflect.getMetadata(DATATYPE_METADATA, Animal);
    const catSchema = Reflect.getMetadata(DATATYPE_METADATA, Cat);
    expect(animalSchema.name).toStrictEqual('Animal');
    expect(catSchema.name).toStrictEqual('Cat');
  })

});

