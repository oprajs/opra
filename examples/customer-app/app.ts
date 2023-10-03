import '@opra/sqb';
import cors from 'cors';
import express from 'express';
import { ApiDocument, ApiDocumentFactory } from '@opra/common';
import { ExpressAdapter } from '@opra/core';
import { SqbClient } from '@sqb/connect';
import { createDatabase } from './db-schema.js';
import { CommonContainer } from './root/common.container.js';
import { SalesContainer } from './root/sales.container.js';
import { GenderEnum } from './types/enums/gender.enum.js';

class App {
  db: SqbClient;
  api: ApiDocument;

  async init() {
    const schema = 'opra_example1';
    this.db = new SqbClient({
      dialect: 'postgres',
      schema
    });
    try {
      await this.db.test();
      await createDatabase(this.db, schema);
      this.api = await ApiDocumentFactory.createDocument({
        version: '1.0',
        info: {
          title: 'TestApi',
          version: 'v1',
        },
        types: [GenderEnum],
        root: {
          resources: [
            CommonContainer, SalesContainer
          ]
        }
      });
      // console.log(util.inspect(service, {depth: 10, colors: true}));
      const expressApp = express();
      expressApp.use(cors());
      await ExpressAdapter.create(expressApp, this.api, {
        basePath: '/svc1',
        logger: console
      });
      const port = 3001;
      expressApp.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`Server running on http://localhost:${port}/svc1`)
      })
    } catch (e) {
      await this.db.close(0);
      throw e;
    }
  }
}

export const app = new App();
