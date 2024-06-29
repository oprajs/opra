import { HttpController, HttpOperation, OmitType } from '@opra/common';
import { SQBAdapter } from '@opra/sqb';
import { SqbClient } from '@sqb/connect';
import { MyProfileService, Profile } from 'customer-sqb';

@HttpController()
export class MyProfileController {
  service: MyProfileService;

  constructor(readonly db: SqbClient) {
    this.service = new MyProfileService({ db });
  }

  @HttpOperation.Entity.Create(Profile, {
    requestBody: {
      type: OmitType(Profile, ['_id']),
    },
  })
  async create(context: HttpOperation.Context) {
    const { data, options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).create(data, options);
  }

  @HttpOperation.Entity.Delete(Profile)
  async delete(context: HttpOperation.Context) {
    const { options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).delete(options);
  }

  @HttpOperation.Entity.Get(Profile)
  async get(context: HttpOperation.Context) {
    const { options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).find(options);
  }

  @HttpOperation.Entity.Update(Profile)
  async update(context: HttpOperation.Context) {
    const { data, options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).update(data, options);
  }
}
