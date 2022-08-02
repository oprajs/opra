import 'reflect-metadata';
import { ComplexType, ComplexTypeDecoratorOptions, DATATYPE_METADATA } from '../src';

describe('ComplexType() decorator', function () {

  it('Should define complex type metadata', async () => {
    const opts: ComplexTypeDecoratorOptions = {
      description: 'Animal schema',
      abstract: false,
      additionalProperties: true
    }
    const Animal = class {
      id: string;
    }
    ComplexType(opts)(Animal);

    const schema = Reflect.getMetadata(DATATYPE_METADATA, Animal);
    expect(schema).toStrictEqual({kind: 'ComplexType', name: 'Animal', ...opts});
  })

  it('Should set alternate name', async () => {
    const Animal = class {
      id: string;
    }
    ComplexType({description: 'Animal schema', name: 'Cat'})(Animal);

    const schema = Reflect.getMetadata(DATATYPE_METADATA, Animal);
    expect(schema.name).toStrictEqual('Cat');
  })

  it('Should not overwrite while extending', async () => {
    const Animal = class {
      id: string;
    }
    ComplexType({description: 'Animal schema'})(Animal);

    const Cat = class extends Animal {
      name: string;
    }
    ComplexType()(Cat);

    const animalSchema = Reflect.getMetadata(DATATYPE_METADATA, Animal);
    const catSchema = Reflect.getMetadata(DATATYPE_METADATA, Cat);
    expect(animalSchema.name).toStrictEqual('Animal');
    expect(catSchema.name).toStrictEqual('Cat');
  })

});

