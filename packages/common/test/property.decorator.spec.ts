import { DATATYPE_PROPERTIES, Property } from '../src';

describe('Property() decorator', function () {

  it('Should define property metadata', async () => {
    const Animal = class {
      id: string;
    }
    const args = {
      description: 'description',
      type: Number,
      enum: ['a', 'b'],
      enumDescriptions: {a: 'a desc', b: 'b desc'},
    }
    Property(args)(Animal.prototype, 'id');
    const properties = Reflect.getMetadata(DATATYPE_PROPERTIES, Animal.prototype);
    expect(properties).toBeDefined();
    expect(properties).toStrictEqual({
      id: {name: 'id', ...args}
    });
  })

  it('Should validate if property name is string', async () => {
    const sym = Symbol('sym');
    const Animal = class {
    }
    expect(() => Property({})(Animal.prototype, sym)).toThrow('can\'t be used')

  })

});

