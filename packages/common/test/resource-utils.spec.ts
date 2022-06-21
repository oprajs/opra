import {extractResourceDefinition} from '../src';
import {ApiCollection} from '../src/decorators/api-collection.decorator';
import {ApiRead} from '../src/decorators/api-read.decorator';

class Animal {

}

@ApiCollection(Animal)
class AnimalResource {
  @ApiRead()
  read() {
    //
  }
}

describe('extractResourceDefinition', function () {
  it('Should extract resource definition', async () => {
    const def = extractResourceDefinition(AnimalResource);
    expect(def).toBeDefined();
    expect(def).toStrictEqual({
      name: 'Animal',
      resourceType: 'collection',
      entityCtor: Animal,
      entityActions: {
        read: {
          resolver: AnimalResource.prototype.read
        }
      }
    });
  })

});

