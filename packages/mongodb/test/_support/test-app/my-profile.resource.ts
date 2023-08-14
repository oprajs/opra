import { Db } from 'mongodb';
import { Singleton } from '@opra/common';
import { Profile } from '@opra/common/test/_support/test-api';
import { OperationContext } from '@opra/core';
import { MongoSingletonResource } from '@opra/mongodb';
import { MyProfileService } from './my-profile.service.js';

@Singleton(Profile)
export class MyProfileResource extends MongoSingletonResource<Profile> {
  service: MyProfileService;

  constructor(readonly db: Db) {
    super();
    this.service = new MyProfileService({db});
  }

  getService(ctx: OperationContext) {
    return this.service.with(ctx);
  }

}
