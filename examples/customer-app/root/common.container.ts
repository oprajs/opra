import { Container } from '@opra/common';
import { CountriesResource } from './common/countries-resource.js';
import { SettingsResource } from './common/settings.resource.js';

@Container({
  resources: [CountriesResource, SettingsResource]
})
export class CommonContainer {

  @Container.Action()
  ping() {
    return {pong: new Date()};
  }

}
