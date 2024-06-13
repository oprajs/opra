import { Profile } from '@opra/common/test/_support/test-api';
import { MongoSingletonService } from '@opra/mongodb';

export class MyProfileService extends MongoSingletonService<Profile> {
  constructor(options?: MongoSingletonService.Options) {
    super(Profile, {
      _id: 1,
      collectionName: 'MyProfile',
      ...options,
    });
  }
}
