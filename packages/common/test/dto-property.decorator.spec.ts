import {DtoProperty, DtoSchema} from '../src';
import {SCHEMA_METADATA, SCHEMA_PROPERTIES, SCHEMA_PROPERTY} from '../src/constants';

describe('DtoProperty() decorator', function () {

  it('Should define property', async () => {
    const Animal = class {
      id: string;
    }
    const args = {
      description: 'description',
      type: Number,
      enum: ['a', 'b'],
      enumDescriptions: {a: 'a desc', b: 'b desc'},
    }
    DtoProperty(args)(Animal.prototype, 'id');
    const properties = Reflect.getMetadata(SCHEMA_PROPERTIES, Animal.prototype);
    expect(properties).toStrictEqual(['id']);
    const idProperty = Reflect.getMetadata(SCHEMA_PROPERTY, Animal.prototype, 'id');
    expect(idProperty).toEqual({name: 'id', ...args});
  })

  it('Should extend from other class', async () => {
    const Animal = class {
      id: string;
    }
    DtoSchema({description: 'Animal schema'})(Animal);
    const animalSchema = Reflect.getMetadata(SCHEMA_METADATA, Animal);
    const args = {
      description: 'description',
      type: Number,
      enum: ['a', 'b'],
      enumDescriptions: {a: 'a desc', b: 'b desc'},
    }
    DtoProperty(args)(Animal.prototype, 'id');

    const Cat = class extends Animal {
      id: string;
      name: string;
    }
    let catSchema = Reflect.getMetadata(SCHEMA_METADATA, Cat);
    expect(catSchema).toStrictEqual(animalSchema);
    let properties = Reflect.getMetadata(SCHEMA_PROPERTIES, Cat.prototype);
    expect(properties).toStrictEqual(['id']);
    let prop = Reflect.getMetadata(SCHEMA_PROPERTY, Animal.prototype, 'id');
    expect(prop).toEqual({...args, name: 'id'});

    DtoSchema()(Cat);
    DtoProperty({...args, description: 'cat description'})(Animal.prototype, 'id');
    DtoProperty()(Animal.prototype, 'name');
    catSchema = Reflect.getMetadata(SCHEMA_METADATA, Cat);
    expect(catSchema.name).toStrictEqual('Cat');
    properties = Reflect.getMetadata(SCHEMA_PROPERTIES, Cat.prototype);
    expect(properties).toStrictEqual(['id', 'name']);
    prop = Reflect.getMetadata(SCHEMA_PROPERTY, Animal.prototype, 'id');
    expect(prop).toEqual({...args, name: 'id', description: 'cat description'});
    prop = Reflect.getMetadata(SCHEMA_PROPERTY, Animal.prototype, 'name');
    expect(prop).toEqual({name: 'name'});

  })


});

