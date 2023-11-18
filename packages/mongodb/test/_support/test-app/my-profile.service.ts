import mongodb from 'mongodb';
import { PartialOutput } from '@opra/common';
import { Profile } from '@opra/common/test/_support/test-api';
import { MongoSingletonService, MongoSingletonServiceBase } from '@opra/mongodb';

let idGen = 1001;

export class MyProfileService extends MongoSingletonService<Profile> {

  constructor(options?: MongoSingletonService.Options) {
    super('MyProfile', {_id: 1, ...options});
  }

  protected async _create(
      doc: mongodb.OptionalUnlessRequiredId<Profile>,
      options?: MongoSingletonServiceBase.CreateOptions
  ): Promise<PartialOutput<Profile>> {
    doc._id = idGen++;
    return super._create(doc, options);
  }

}
