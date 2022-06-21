import {DtoSchema} from '../src';
import {SCHEMA_METADATA} from '../src/constants';

describe('DtoSchema() decorator', function () {

  it('Should define schema metadata', async () => {
    const Animal = class {
      id: string;
    }
    DtoSchema({description: 'Animal schema'})(Animal);
    const schema = Reflect.getMetadata(SCHEMA_METADATA, Animal);
    expect(schema.name).toStrictEqual('Animal');
    expect(schema.description).toStrictEqual('Animal schema');
  })

  it('Should set alternate name', async () => {
    const Animal = class {
      id: string;
    }
    DtoSchema({description: 'Animal schema', name: 'Cat'})(Animal);
    const schema = Reflect.getMetadata(SCHEMA_METADATA, Animal);
    expect(schema.name).toStrictEqual('Cat');
  })

  it('Should extend from other class', async () => {
    const Animal = class {
      id: string;
    }
    DtoSchema({description: 'Animal schema'})(Animal);
    const animalSchema = Reflect.getMetadata(SCHEMA_METADATA, Animal);

    const Cat = class extends Animal {
      id: string;
      name: string;
    }
    let catSchema = Reflect.getMetadata(SCHEMA_METADATA, Cat);
    expect(catSchema).toStrictEqual(animalSchema);
    DtoSchema()(Cat);
    catSchema = Reflect.getMetadata(SCHEMA_METADATA, Cat);
    expect(catSchema).toStrictEqual({name: 'Cat'});
  })

});

