import { Singleton } from '@opra/common';
import { Profile } from '@opra/common/test/_support/test-api';
import { RequestContext } from '@opra/core';
import { SqbEntityService, SqbSingletonResource } from '@opra/sqb';
import { SqbClient } from '@sqb/connect';

@Singleton(Profile)
export class MyProfileResource extends SqbSingletonResource<Profile> {
  service: SqbEntityService<Profile>;

  constructor(readonly db: SqbClient) {
    super();
    this.service = new SqbEntityService(Profile, {db});
  }

  getService(ctx: RequestContext) {
    return this.service.with(ctx);
  }

}
