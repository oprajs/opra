import { ApiDocument, OpraSchema } from '@opra/common';
import { ExpressAdapter } from '@opra/core';
import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import supertest from 'supertest';
import { createTestApi, CustomersController } from '../_support/test-api/index.js';

describe('ExpressAdapter', () => {
  let document: ApiDocument;
  let app: Express;
  let adapter: ExpressAdapter;

  beforeAll(async () => {
    document = await createTestApi();
    app = express();
    app.use(cookieParser());
    adapter = new ExpressAdapter(app, document, { basePath: 'api' });
  });

  afterAll(async () => adapter.close());
  afterAll(() => global.gc && global.gc());

  it('Should call HttpController onInit method while init', async () => {
    const instance = adapter.getControllerInstance<CustomersController>('/Customers');
    expect(instance).toBeDefined();
    expect(instance).toBeInstanceOf(CustomersController);
    expect(instance!.initialized).toEqual(true);
    expect(instance!.closed).toEqual(false);
  });

  it('Should init all routes', async () => {
    const routerStack = app._router.stack.find(x => x.name === 'router');
    expect(routerStack).toBeDefined();
    const paths = routerStack.handle.stack
      .filter(x => x.route)
      .map(x => x.route.path + ' | ' + Object.keys(x.route.methods).join(',').toUpperCase());

    expect(paths).toEqual([
      '/\\$schema | GET',
      '/ping | GET',
      '/Auth/login | GET',
      '/Auth/logout | GET',
      '/Auth/getToken | GET',
      '/Auth/getRawToken | GET',
      '/Customers | POST',
      '/Customers | DELETE',
      '/Customers | PATCH',
      '/Customers | GET',
      '/Customers/sendMessageAll | GET',
      '/Customers@:customerId | GET',
      '/Customers@:customerId | DELETE',
      '/Customers@:customerId | PATCH',
      '/Customers@:customerId/sendMessage | GET',
      '/Customers@:customerId/Addresses | POST',
      '/Customers@:customerId/Addresses | GET',
      '/Customers@:customerId/Addresses@:addressId | GET',
      '/Files | POST',
      '/MyProfile | POST',
      '/MyProfile | DELETE',
      '/MyProfile | GET',
      '/MyProfile | PATCH',
    ]);
  });

  it('Should return 404 error if route not found', async () => {
    const resp = await supertest(app).get('/api/notexist?x=1');
    expect(resp.status).toStrictEqual(404);
    expect(resp.body).toEqual({
      errors: [
        {
          code: 'NOT_FOUND',
          message: 'No endpoint found at [GET]/api/notexist',
          severity: 'error',
          details: {
            method: 'GET',
            path: '/api/notexist',
          },
        },
      ],
    });
  });

  it('Should GET:/$schema return api schema ', async () => {
    const resp = await supertest(app).get('/api/$schema');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeInstanceOf(Object);
    expect(resp.body.spec).toEqual(OpraSchema.SpecVersion);
  });

  it('Should call HttpController onShutdown method on close', async () => {
    const instance = adapter.getControllerInstance<CustomersController>('/Customers');
    await adapter.close();
    expect(instance).toBeDefined();
    expect(instance).toBeInstanceOf(CustomersController);
    expect(instance!.initialized).toEqual(true);
    expect(instance!.closed).toEqual(true);
  });
});
