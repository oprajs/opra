import { HttpController, HttpOperation } from '@opra/common';
import { AuthController } from './auth.controller.js';
import { CustomerController } from './customer.controller.js';
import { CustomersController } from './customers.controller.js';
import { FilesController } from './files.controller.js';
import { MyProfileController } from './my-profile.controller.js';

@HttpController({
  description: 'Api root',
  controllers: [AuthController, CustomersController, CustomerController, FilesController, MyProfileController],
})
export class RootController {
  @HttpOperation({ path: 'ping' }).Response(200, {
    type: 'datetime',
  })
  ping() {
    return new Date();
  }
}
