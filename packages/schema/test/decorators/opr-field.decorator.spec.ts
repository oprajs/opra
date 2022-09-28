import { COMPLEXTYPE_FIELDS, OprField } from '../../src/index.js';

describe('OprField() decorator', function () {

  it('Should define field metadata', async () => {
    class Animal {
      @OprField({
        description: 'description',
        enum: ['a', 'b']
      })
      id: number;
    }

    const fields = Reflect.getMetadata(COMPLEXTYPE_FIELDS, Animal);
    expect(fields).toBeDefined();
    expect(fields).toStrictEqual({
      id: {
        type: Number,
        description: 'description',
        enum: ['a', 'b']
      }
    });
  })

  it('Should set design type if "type" is not defined', async () => {
    class Country {
      @OprField()
      id: number;
      @OprField()
      name: string;
    }

    class Person {
      @OprField()
      country: Country;
    }

    const fields = Reflect.getMetadata(COMPLEXTYPE_FIELDS, Person);
    expect(fields).toBeDefined();
    expect(fields).toStrictEqual({
      country: {
        type: Country
      }
    });
  })

  it('Should validate if field name is string', async () => {
    const sym = Symbol('sym');

    class Person {
    }

    expect(() => OprField({})(Person.prototype, sym)).toThrow('can\'t be used')

  })

});

