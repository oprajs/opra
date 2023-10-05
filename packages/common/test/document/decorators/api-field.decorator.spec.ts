import { ApiField, DATATYPE_METADATA } from '@opra/common';

describe('ApiField() decorator', function () {

  afterAll(() => global.gc && global.gc());

  it('Should define field metadata', async () => {
    class Animal {
      @ApiField({
        type: 'integer',
        description: 'description'
      })
      id: number;
    }

    const metadata = Reflect.getMetadata(DATATYPE_METADATA, Animal)
    expect(metadata).toBeDefined();
    expect(metadata.fields).toMatchObject({
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

    const metadata = Reflect.getMetadata(DATATYPE_METADATA, Person);
    expect(metadata).toBeDefined();
    expect(metadata.fields).toMatchObject({
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

});

