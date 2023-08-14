import mongodb from 'mongodb';
import { Profile } from '@opra/common/test/_support/test-api';
import { MongoEntityService } from '@opra/mongodb';

let idGen = 1001;

export class MyProfileService extends MongoEntityService<Profile> {

  constructor(options?: MongoEntityService.Options) {
    super('MyProfile', options);
  }

  async insertOne(doc: mongodb.OptionalUnlessRequiredId<Profile>, options?: mongodb.InsertOneOptions) {
    doc._id = idGen++;
    return super.insertOne(doc, options);
  }

}
