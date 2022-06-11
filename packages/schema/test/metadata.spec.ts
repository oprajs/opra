import {SchemaMetadata} from '../src';

describe('SchemaMetadata', function () {

  it('Should SchemaMetadata.defineMetadata create SchemaMetadata instance', async () => {
    const Animal = class {
      id: string;
    }
    const schema = SchemaMetadata.defineMetadata(Animal, {description: 'Animal schema'});
    expect(schema).toBeInstanceOf(SchemaMetadata);
    expect(schema.name).toStrictEqual('Animal');
    expect(schema.description).toStrictEqual('Animal schema');
    expect(schema.ctor).toBe(Animal);
  })

  it('Should set alternate name', async () => {
    const Animal = class {
      id: string;
    }
    const schema = SchemaMetadata.defineMetadata(Animal, {name: 'Cat'});
    expect(schema).toBeInstanceOf(SchemaMetadata);
    expect(schema.name).toStrictEqual('Cat');
    expect(schema.ctor).toBe(Animal);
  })

  it('Should define property', async () => {
    const Animal = class {
      id: string;
    }
    const schema = SchemaMetadata.defineMetadata(Animal);
    const args = {
      description: 'description',
      type: Number,
      enum: ['a', 'b'],
      enumDescriptions: {a: 'a desc', b: 'b desc'},
    };
    schema.defineProperty('id', args);
    expect(schema.properties).toEqual({id: {schema, name: 'id', ...args}});
  })

  it('Should extend from other class', async () => {
    const Animal = class {
      id: string;
    }
    const animalSchema = SchemaMetadata.defineMetadata(Animal);
    const args = {
      description: 'description',
      type: Number,
      enum: ['a', 'b'],
      enumDescriptions: {a: 'a desc', b: 'b desc'},
    };
    animalSchema.defineProperty('id', args);

    const Cat = class extends Animal {
      id: string;
    }
    const catSchema = SchemaMetadata.defineMetadata(Cat);
    expect(catSchema.getBaseSchema()).toBe(animalSchema);
    expect(catSchema.properties).toEqual({id: {schema: catSchema, name: 'id', ...args}});
  })


});

