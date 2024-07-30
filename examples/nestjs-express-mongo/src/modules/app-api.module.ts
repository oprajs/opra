import { Logger, Module } from '@nestjs/common';
import { OpraHttpModule, OpraNestAdapter } from '@opra/nestjs';
import { CustomerModelsDocument } from 'customer-mongo';
import * as process from 'node:process';
import { AuthController } from '../api/auth.controller.js';
import { CustomerController } from '../api/customer.controller.js';
import { CustomerNotesController } from '../api/customer-notes.controller.js';
import { CustomersController } from '../api/customers-controller.js';
import { AppDbModule } from './app-db.module.js';

@Module({
  imports: [
    AppDbModule,
    OpraHttpModule.forRoot(
      {
        info: {
          title: 'Customer Application',
          version: '1.0',
        },
        references: {
          cm: () => CustomerModelsDocument.create(),
        },
        name: 'CustomerApi',
        controllers: [AuthController, CustomerController, CustomersController, CustomerNotesController],
      },
      {
        schemaRouteIsPublic: true,
      },
    ),
  ],
})
export class AppApiModule {
  readonly logger: Logger;

  constructor(readonly opraAdapter: OpraNestAdapter) {
    this.logger = new Logger(opraAdapter.document.api!.name!);
    opraAdapter.on('request', context => {
      if (process.env.NODE_ENV !== 'test') {
        const { request } = context;
        this.logger.verbose(`Request from: ${request.ip} | ${request.method} | ${request.url}`);
      }
    });
    opraAdapter.on('error', context => {
      if (process.env.NODE_ENV !== 'test') {
        const { request, response, errors } = context;
        errors.forEach(error => this.logger.error(`${response.statusCode}|${request.ip}|${error}`));
      }
    });
  }
}
