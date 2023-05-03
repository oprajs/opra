import { Db } from 'mongodb';
import { Singleton } from '@opra/common';
import { Profile } from '@opra/common/test/_support/test-api';
import { RequestContext } from '@opra/core';
import { MongoEntityService, MongoSingletonResource } from '@opra/mongodb';

@Singleton(Profile)
export class MyProfileResource extends MongoSingletonResource<Profile> {
  service: MongoEntityService<Profile>;

  constructor(readonly db: Db) {
    super();
    this.service = new MongoEntityService('MyProfile', {db});
  }

  getService(ctx: RequestContext) {
    return this.service.with(ctx);
  }

}