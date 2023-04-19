import { ApiField, METADATA_KEY } from '@opra/common';

describe('ApiField() decorator', function () {

  it('Should define field metadata', async () => {
    class Animal {
      @ApiField({
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
      @ApiField()
      id: number;
      @ApiField()
      name: string;
    }

    class Person {
      @ApiField()
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

    expect(() => ApiField({})(Person.prototype, sym)).toThrow('can\'t be used')

  })

  it('Should define enum with array', async () => {
    class Animal {
      @ApiField({
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

