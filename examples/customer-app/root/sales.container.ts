import { Container } from '@opra/common';
import { CustomersResource } from './sales/customers.resource.js';

@Container({
  resources: [CustomersResource]
})
export class SalesContainer {

  @Container.Action()
  ping() {
    return {pong: new Date()};
  }

}
