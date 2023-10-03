import {
  Singleton,
} from '@opra/common';
import { Settings } from '../../types/entities/settings.entity.js';

const settings = new Settings({
  companyName: 'Example Company',
  companyEmail: 'example@company.com',
  sessionTimeout: 30000
});

@Singleton(Settings, {
  description: 'Best Customer resource'
})
export class SettingsResource {

  @Singleton.Get()
  get() {
    return settings;
  }

  @Singleton.Update()
  update(context: Singleton.Update.Context) {
    const {request} = context;
    Object.assign(settings, request.data);
    return settings;
  }

}
