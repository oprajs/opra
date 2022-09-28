import 'reflect-metadata';
import { ComplexTypeDecoratorOptions, DATATYPE_METADATA, OprComplexType } from '../../src/index.js';

describe('OprComplexType() decorator', function () {

  it('Should define complex type metadata', async function () {
    const opts: ComplexTypeDecoratorOptions = {
      description: 'Animal schema',
      abstract: false,
      additionalFields: true
    }

    @OprComplexType(opts)
    class Animal {
      id: string;
    }

    const schema = Reflect.getMetadata(DATATYPE_METADATA, Animal);
    expect(schema).toStrictEqual({kind: 'ComplexType', name: 'Animal', ...opts});
  })

  it('Should set alternate name', async () => {

    @OprComplexType({description: 'Animal schema', name: 'Cat'})
    class Animal {
      id: string;
    }

    const schema = Reflect.getMetadata(DATATYPE_METADATA, Animal);
    expect(schema.name).toStrictEqual('Cat');
  })

  it('Should not overwrite while extending', async () => {

    @OprComplexType({description: 'Animal schema'})
    class Animal {
      id: string;
    }

    @OprComplexType()
    class Cat extends Animal {
      name: string;
    }

    const animalSchema = Reflect.getMetadata(DATATYPE_METADATA, Animal);
    const catSchema = Reflect.getMetadata(DATATYPE_METADATA, Cat);
    expect(animalSchema.name).toStrictEqual('Animal');
    expect(catSchema.name).toStrictEqual('Cat');
  })

});

