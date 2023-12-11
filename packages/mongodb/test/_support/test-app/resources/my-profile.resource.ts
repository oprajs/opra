import { Db } from 'mongodb';
import { ISingleton, PartialDTO, Singleton } from '@opra/common';
import { Profile } from '@opra/common/test/_support/test-api/index';
import { MyProfileService } from '../services/my-profile.service.js';

@Singleton(Profile)
export class MyProfileResource implements ISingleton<Profile> {
  service: MyProfileService;

  constructor(readonly db: Db) {
    this.service = new MyProfileService({db});
  }

  @Singleton.Create()
  create(context: Singleton.Create.Context): Promise<PartialDTO<Profile>> {
    const {request} = context;
    return this.service.for(context)
        .create(request.data, request.params);
  }

  @Singleton.Delete()
  delete(context: Singleton.Delete.Context): Promise<number> | undefined {
    const {request} = context;
    return this.service.for(context)
        .delete(request.params);
  }

  @Singleton.Get()
  get(context: Singleton.Get.Context): Promise<PartialDTO<Profile> | undefined> {
    const {request} = context;
    return this.service.for(context)
        .get(request.params);
  }

  @Singleton.Update()
  update(context: Singleton.Update.Context): Promise<PartialDTO<Profile> | undefined> {
    const {request} = context;
    return this.service.for(context)
        .update(request.data, request.params);
  }

}
