import { HttpController, HttpOperation, OmitType } from '@opra/common';
import { HttpContext } from '@opra/http';
import { SQBAdapter } from '@opra/sqb';
import { SqbClient } from '@sqb/connect';
import { MyProfileService, Profile } from 'example-customer-sqb';

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
  async create(context: HttpContext) {
    const { data, options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).create(data, options);
  }

  @HttpOperation.Entity.Delete(Profile)
  async delete(context: HttpContext) {
    const { options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).delete(options);
  }

  @HttpOperation.Entity.Get(Profile)
  async get(context: HttpContext) {
    const { options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).find(options);
  }

  @HttpOperation.Entity.Update(Profile)
  async update(context: HttpContext) {
    const { data, options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).update(data, options);
  }
}
