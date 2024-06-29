import { HttpController, HttpOperation, OmitType } from '@opra/common';
import { MongoAdapter } from '@opra/mongodb';
import { MyProfileService, Profile } from 'customer-mongo';
import { Db } from 'mongodb';

@HttpController().Header('accessToken', 'string')
export class MyProfileController {
  service: MyProfileService;

  constructor(readonly db: Db) {
    this.service = new MyProfileService({ db });
  }

  @HttpOperation.Entity.Create(Profile, {
    requestBody: {
      type: OmitType(Profile, ['_id']),
    },
  })
  async create(context: HttpOperation.Context) {
    const { data, options } = await MongoAdapter.parseRequest(context);
    return this.service.for(context).create(data, options);
  }

  @HttpOperation.Entity.Delete(Profile)
  async delete(context: HttpOperation.Context) {
    const { options } = await MongoAdapter.parseRequest(context);
    return this.service.for(context).delete(options);
  }

  @HttpOperation.Entity.Get(Profile)
  async get(context: HttpOperation.Context) {
    const { options } = await MongoAdapter.parseRequest(context);
    return this.service.for(context).find(options);
  }

  @HttpOperation.Entity.Update(Profile)
  async update(context: HttpOperation.Context) {
    const { data, options } = await MongoAdapter.parseRequest(context);
    return this.service.for(context).update(data, options);
  }
}
