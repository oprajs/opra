import {DtoProperty, ComplexDto} from '@opra/common/src';
import {DTO_METADATA, DTO_PROPERTIES, DTO_PROPERTY_METADATA} from './constants';

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
    const properties = Reflect.getMetadata(DTO_PROPERTIES, Animal.prototype);
    expect(properties).toStrictEqual(['id']);
    const idProperty = Reflect.getMetadata(DTO_PROPERTY_METADATA, Animal.prototype, 'id');
    expect(idProperty).toEqual({name: 'id', ...args});
  })

  it('Should extend from other class', async () => {
    const Animal = class {
      id: string;
    }
    ComplexDto({description: 'Animal model'})(Animal);
    const animalSchema = Reflect.getMetadata(DTO_METADATA, Animal);
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
    let catSchema = Reflect.getMetadata(DTO_METADATA, Cat);
    expect(catSchema).toStrictEqual(animalSchema);
    let properties = Reflect.getMetadata(DTO_PROPERTIES, Cat.prototype);
    expect(properties).toStrictEqual(['id']);
    let prop = Reflect.getMetadata(DTO_PROPERTY_METADATA, Animal.prototype, 'id');
    expect(prop).toEqual({...args, name: 'id'});

    ComplexDto()(Cat);
    DtoProperty({...args, description: 'cat description'})(Animal.prototype, 'id');
    DtoProperty()(Animal.prototype, 'name');
    catSchema = Reflect.getMetadata(DTO_METADATA, Cat);
    expect(catSchema.name).toStrictEqual('Cat');
    properties = Reflect.getMetadata(DTO_PROPERTIES, Cat.prototype);
    expect(properties).toStrictEqual(['id', 'name']);
    prop = Reflect.getMetadata(DTO_PROPERTY_METADATA, Animal.prototype, 'id');
    expect(prop).toEqual({...args, name: 'id', description: 'cat description'});
    prop = Reflect.getMetadata(DTO_PROPERTY_METADATA, Animal.prototype, 'name');
    expect(prop).toEqual({name: 'name'});

  })


});

