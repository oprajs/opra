import { Expose, METADATA_KEY } from '@opra/common';

describe('Expose() decorator', function () {

  it('Should define field metadata', async () => {
    class Animal {
      @Expose({
        type: 'integer',
        description: 'description'
      })
      id: number;
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, Animal)
    expect(metadata).toBeDefined();
    expect(metadata.elements).toStrictEqual({
      id: {
        type: 'integer',
        designType: Number,
        description: 'description',
      }
    });
  })

  it('Should determine design type if "type" is not defined', async () => {
    class Country {
      @Expose()
      id: number;
      @Expose()
      name: string;
    }

    class Person {
      @Expose()
      country: Country;
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, Person);
    expect(metadata).toBeDefined();
    expect(metadata.elements).toStrictEqual({
      country: {
        designType: Country
      }
    });
  })

  it('Should validate if field name is string', async () => {
    const sym = Symbol('sym');

    class Person {
    }

    expect(() => Expose({})(Person.prototype, sym)).toThrow('can\'t be used')

  })

  it('Should define enum with array', async () => {
    class Animal {
      @Expose({
        description: 'description',
        enum: ['A', 'B']
      })
      id: number;
    }

    const metadata = Reflect.getMetadata(METADATA_KEY, Animal)
    expect(metadata).toBeDefined();
    expect(metadata.elements).toStrictEqual({
      id: {
        designType: Number,
        description: 'description',
        enum: {A: 'A', B: 'B'}
      }
    });
  })

});

