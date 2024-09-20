import { HttpController, HttpOperation } from '@opra/common';
import { HttpContext } from '@opra/http';
import { Gender, Profile } from 'customer-mongo/models';

@HttpController({
  description: 'My profile resource',
})
export class MyProfileController {
  public idGen = 1;
  public data: Profile | undefined = {
    _id: 1,
    givenName: 'Jessica Hugo',
    familyName: 'Something',
    gender: Gender.FEMALE,
    createdAt: new Date(),
  };

  @HttpOperation.Entity.Create(Profile)
  async create(context: HttpContext) {
    const body = await context.getBody<Profile>();
    this.data = { ...body, _id: ++this.idGen };
    return this.data;
  }

  @HttpOperation.Entity.Delete(Profile)
  delete() {
    if (this.data) {
      this.data = undefined;
      return true;
    }
  }

  @(HttpOperation.Entity.Get(Profile)
    .Header('h1', { type: Boolean })
    .Header('h2', { type: 'integer', isArray: true })
    .Header('h3', { type: 'integer', required: true }))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(context: HttpContext) {
    return this.data;
  }

  @(HttpOperation.Entity.Update(Profile).QueryParam('p1', { required: true }))
  async update(context: HttpContext) {
    if (this.data) {
      const body = await context.getBody<Profile>();
      this.data = { ...this.data, ...body, _id: this.data._id };
      return this.data;
    }
  }
}
