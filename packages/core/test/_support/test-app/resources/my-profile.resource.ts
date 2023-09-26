import '@opra/core';
import { Singleton } from '@opra/common';
import { Profile } from '../entities/profile.entity.js';
import { GenderEnum } from '../enums/gender.enum.js';

@Singleton(Profile, {
  description: 'Best Customer resource'
})
export class MyProfileResource {
  public idGen = 1;
  public data: Profile | undefined = {
    _id: 1,
    givenName: 'Jessica Hugo',
    familyName: 'Something',
    gender: GenderEnum.FEMALE
  }

  @Singleton.Create()
  async create(context: Singleton.Create.Context) {
    this.data = {_id: ++this.idGen, ...context.request.data};
    return this.data;
  }

  @Singleton.Delete()
  delete() {
    if (this.data) {
      this.data = undefined;
      return true;
    }
  }

  @Singleton.Get()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(context: Singleton.Get.Context) {
    return this.data;
  }

  @Singleton.Update()
  update(context: Singleton.Update.Context) {
    if (this.data) {
      this.data = {...this.data, ...context.request.data, _id: this.data._id};
      return this.data;
    }
  }

  @Singleton.Action()
      .Parameter('message', String)
  async sendMessage() {
    return {sent: 1}
  }

}
