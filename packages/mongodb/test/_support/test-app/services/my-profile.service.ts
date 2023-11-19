import mongodb from 'mongodb';
import { PartialInput } from '@opra/common';
import { Profile } from '@opra/common/test/_support/test-api';
import { MongoSingletonService } from '@opra/mongodb';

let idGen = 1001;

export class MyProfileService extends MongoSingletonService<Profile> {

  constructor(options?: MongoSingletonService.Options) {
    super(Profile, {
      _id: 1,
      collectionName: 'MyProfile',
      ...options
    });
  }

  async create(
      doc: mongodb.OptionalUnlessRequiredId<Profile>,
      options?: MongoSingletonService.CreateOptions
  ) {
    doc._id = idGen++;
    return super.create(doc, options);
  }

  async delete(options?: MongoSingletonService.DeleteOptions<Profile>) {
    return super.delete(options);
  }

  async get(options?: MongoSingletonService.GetOptions<Profile>) {
    return super.get(options);
  }

  async update(
      doc: PartialInput<Profile>,
      options?: MongoSingletonService.UpdateOptions<Profile>
  ) {
    return super.update(doc, options);
  }

}
