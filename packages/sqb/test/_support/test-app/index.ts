import '@sqb/postgres';
import express from 'express';
import { ApiDocument, ApiDocumentFactory, HttpOperation } from '@opra/common';
import { ExpressAdapter, HttpContext, HttpIncoming, HttpOutgoing } from '@opra/core';
import { SqbClient } from '@sqb/connect';
import { CustomersController } from './api/customers-controller.js';
import { MyProfileController } from './api/my-profile.controller.js';
import { Country } from './entities/country.entity.js';
import { Customer } from './entities/customer.entity.js';
import { Profile } from './entities/profile.entity.js';
import { GenderEnum } from './enums/gender.enum.js';
import { Address } from './types/address.type.js';
import { Note } from './types/note.type.js';
import { Person } from './types/person.type.js';
import { Record } from './types/record.type.js';

export class TestApp {
  adapter: ExpressAdapter;
  document: ApiDocument;
  db: SqbClient;

  static async create(): Promise<TestApp> {
    const out = new TestApp();
    try {
      out.db = new SqbClient({
        dialect: 'postgres',
        schema: 'opra_test',
      });
    } catch (e) {
      await out.close();
      throw e;
    }
    out.document = await ApiDocumentFactory.createDocument({
      info: {
        title: 'TestApi',
        version: '1.0',
      },
      types: [Customer, Profile, Record, Person, Address, Note, Country, GenderEnum],
      api: {
        name: 'TestApi',
        protocol: 'http',
        controllers: [new CustomersController(out.db), new MyProfileController(out.db)],
      },
    });
    const app = express();
    out.adapter = new ExpressAdapter(app, out.document);

    return out;
  }

  protected constructor() {}

  async close() {
    await this.db?.close();
    await this.adapter?.close();
  }

  createContext(operation?: HttpOperation, request?: HttpIncoming) {
    request = request || HttpIncoming.from({ method: 'GET', url: '/' });
    const response = HttpOutgoing.from({ req: request });
    return new HttpContext({
      adapter: this.adapter,
      operation,
      controller: operation?.owner,
      platform: 'express',
      platformArgs: {},
      request,
      response,
    });
  }
}
