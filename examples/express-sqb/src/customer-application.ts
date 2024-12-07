/* eslint-disable no-console */
import '@sqb/postgres';
import { ApiDocument } from '@opra/common';
import { ExpressAdapter, HttpAdapter } from '@opra/http';
import { SqbClient } from '@sqb/connect';
import express from 'express';
import { CustomerApiDocument } from './api-document.js';

export class CustomerApplication {
  declare adapter: ExpressAdapter;
  declare document: ApiDocument;
  declare express: express.Express;
  declare db: SqbClient;

  static async create(
    options?: HttpAdapter.Options,
  ): Promise<CustomerApplication> {
    const app = new CustomerApplication();
    try {
      app.db = new SqbClient({
        dialect: 'postgres',
        schema: process.env.PG_DATABASE || 'customer_app',
        password: process.env.PG_PASSWORD || 'postgres',
      });
    } catch (e) {
      await app.close();
      throw e;
    }
    // app.db.on('execute', r => {
    //   let s = `Executing sql expression\n\x1b[32m${r.sql}`;
    //   if (r.params) {
    //     s += `${
    //       '\n' +
    //       '\x1b[36m' + // Cyan
    //       'Params:' +
    //       '\x1b[0m'
    //     }${
    //       // Reset color
    //       inspect(r.params, { depth: 10, colors: true })
    //     }`;
    //   }
    //   console.log(s);
    // });
    app.document = await CustomerApiDocument.create(app.db);
    app.express = express();
    app.adapter = new ExpressAdapter(app.express, options);
    await app.adapter.initialize(app.document);
    return app;
  }

  protected constructor() {}

  async close() {
    await this.db?.close();
    await this.adapter?.close();
  }
}
