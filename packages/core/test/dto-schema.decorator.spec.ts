import {ComplexDto} from '@opra/common/src';
import { DTO_METADATA } from '../src/constants';

describe('DtoSchema() decorator', function () {

  it('Should define schema metadata', async () => {
    const Animal = class {
      id: string;
    }
    ComplexDto({description: 'Animal schema'})(Animal);
    const schema = Reflect.getMetadata(DTO_METADATA, Animal);
    expect(schema.name).toStrictEqual('Animal');
    expect(schema.description).toStrictEqual('Animal schema');
  })

  it('Should set alternate name', async () => {
    const Animal = class {
      id: string;
    }
    ComplexDto({description: 'Animal schema', name: 'Cat'})(Animal);
    const schema = Reflect.getMetadata(DTO_METADATA, Animal);
    expect(schema.name).toStrictEqual('Cat');
  })

  it('Should extend from other class', async () => {
    const Animal = class {
      id: string;
    }
    ComplexDto({description: 'Animal schema'})(Animal);
    const animalSchema = Reflect.getMetadata(DTO_METADATA, Animal);

    const Cat = class extends Animal {
      id: string;
      name: string;
    }
    let catSchema = Reflect.getMetadata(DTO_METADATA, Cat);
    expect(catSchema).toStrictEqual(animalSchema);
    ComplexDto()(Cat);
    catSchema = Reflect.getMetadata(DTO_METADATA, Cat);
    expect(catSchema).toStrictEqual({name: 'Cat'});
  })

});

