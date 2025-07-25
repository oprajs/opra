import { ComplexType, DATATYPE_METADATA } from '@opra/common';
import { expect } from 'expect';

describe('common:ComplexType() decorator', () => {
  it('Should define ComplexType metadata', async () => {
    const opts: ComplexType.Options = {
      description: 'Animal schema',
      abstract: false,
      additionalFields: true,
      scopePattern: 'public',
    };

    @ComplexType(opts)
    class Animal {
      declare id: string;
    }

    const schema = Reflect.getMetadata(DATATYPE_METADATA, Animal);
    expect(schema).toStrictEqual({
      kind: 'ComplexType',
      name: 'Animal',
      ...opts,
      scopePattern: 'public',
      additionalFields: true,
    });
  });

  it('Should set alternate name', async () => {
    @ComplexType({ description: 'Animal schema', name: 'Cat' })
    class Animal {
      declare id: string;
    }

    const schema = Reflect.getMetadata(DATATYPE_METADATA, Animal);
    expect(schema.name).toStrictEqual('Cat');
  });

  it('Should not overwrite while extending', async () => {
    @ComplexType({ description: 'Animal schema' })
    class Animal {
      declare id: string;
    }

    @ComplexType()
    class Cat extends Animal {
      declare name: string;
    }

    const animalSchema = Reflect.getMetadata(DATATYPE_METADATA, Animal);
    const catSchema = Reflect.getMetadata(DATATYPE_METADATA, Cat);
    expect(animalSchema.name).toStrictEqual('Animal');
    expect(catSchema.name).toStrictEqual('Cat');
  });
});
