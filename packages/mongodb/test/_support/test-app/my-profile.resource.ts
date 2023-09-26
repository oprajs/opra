import { Db } from 'mongodb';
import { Singleton } from '@opra/common';
import { Profile } from '@opra/common/test/_support/test-api';
import { RequestContext } from '@opra/core';
import { MongoSingleton } from '@opra/mongodb';
import { MyProfileService } from './my-profile.service.js';

@Singleton(Profile)
export class MyProfileResource extends MongoSingleton<Profile> {
  service: MyProfileService;

  constructor(readonly db: Db) {
    super();
    this.service = new MyProfileService({db});
  }

  getService(ctx: RequestContext) {
    return this.service.with(ctx);
  }

}
