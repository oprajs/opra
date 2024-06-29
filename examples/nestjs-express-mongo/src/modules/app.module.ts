import { Module } from '@nestjs/common';
import { OpraHttpModule } from '@opra/nestjs';
import { CustomerModelsDocument } from 'customer-mongo';
import { AuthController } from '../api/auth.controller.js';
import { CustomerController } from '../api/customer.controller.js';
import { CustomerNotesController } from '../api/customer-notes.controller.js';
import { CustomersController } from '../api/customers-controller.js';
import { AppDbModule } from './app-db.module.js';

@Module({
  imports: [
    AppDbModule,
    OpraHttpModule.forRoot({
      info: {
        title: 'Customer Application',
        version: '1.0',
      },
      references: {
        cm: () => CustomerModelsDocument.create(),
      },
      name: 'CustomerApi',
      controllers: [AuthController, CustomerController, CustomersController, CustomerNotesController],
    }),
  ],
})
export class ApplicationModule {}
