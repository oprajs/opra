import 'reflect-metadata';
import { ComplexType, METADATA_KEY } from '@opra/common';

describe('ComplexType() decorator', function () {

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

    const schema = Reflect.getMetadata(METADATA_KEY, Animal);
    expect(schema).toStrictEqual({kind: 'ComplexType', name: 'Animal', ...opts});
  })

  it('Should set alternate name', async () => {

    @ComplexType({description: 'Animal schema', name: 'Cat'})
    class Animal {
      id: string;
    }

    const schema = Reflect.getMetadata(METADATA_KEY, Animal)
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

    const animalSchema = Reflect.getMetadata(METADATA_KEY, Animal);
    const catSchema = Reflect.getMetadata(METADATA_KEY, Cat);
    expect(animalSchema.name).toStrictEqual('Animal');
    expect(catSchema.name).toStrictEqual('Cat');
  })

});

