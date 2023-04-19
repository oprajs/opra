import { ComplexField, METADATA_KEY } from '@opra/common';

describe('ComplexField() decorator', function () {

  it('Should define field metadata', async () => {
    class Animal {
      @ComplexField({
        type: 'integer',
        description: 'description'
      })
      id: number;
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, Animal)
    expect(metadata).toBeDefined();
    expect(metadata.fields).toStrictEqual({
      id: {
        type: 'integer',
        designType: Number,
        description: 'description',
      }
    });
  })

  it('Should determine design type if "type" is not defined', async () => {
    class Country {
      @ComplexField()
      id: number;
      @ComplexField()
      name: string;
    }

    class Person {
      @ComplexField()
      country: Country;
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, Person);
    expect(metadata).toBeDefined();
    expect(metadata.fields).toStrictEqual({
      country: {
        designType: Country
      }
    });
  })

  it('Should validate if field name is string', async () => {
    const sym = Symbol('sym');

    class Person {
    }

    expect(() => ComplexField({})(Person.prototype, sym)).toThrow('can\'t be used')

  })

  it('Should define enum with array', async () => {
    class Animal {
      @ComplexField({
        description: 'description',
        enum: ['A', 'B']
      })
      id: number;
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, Animal)
    expect(metadata).toBeDefined();
    expect(metadata.fields).toStrictEqual({
      id: {
        designType: Number,
        description: 'description',
        enum: {A: 'A', B: 'B'}
      }
    });
  })

});

