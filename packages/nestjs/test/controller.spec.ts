import {Server} from 'http';
import request from 'supertest';
import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {Api, OpraModule} from '@opra/nestjs';
import {OpraURL} from '@opra/url';
import {Customer} from './_support/test-app/svc1/customer/customer.dto.js';

describe('Controller', function () {

  let server: Server;
  let app: INestApplication;
  let lastRequest: any | undefined;

  @Api.Collection(Customer)
  class TestController {
    @Api.collection.List()
    async findAll(@Api.Request() req) {
      lastRequest = req;
    }
    @Api.collection.Get()
    async get(@Api.Request() req) {
      lastRequest = req;
    }
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [OpraModule.forRoot()],
      controllers: [TestController]
    }).compile();
    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  })

  afterEach(() => lastRequest = undefined);

  afterAll(() => app.close());

  it('Should create collection request', async function () {
    const url = new OpraURL('/Customer');
    const res = await request(server).get(url.toString());
    expect(res).toBeDefined();
    expect(res.status).toStrictEqual(200);
    expect(lastRequest).toBeDefined();
    if (!lastRequest) return;
    expect(lastRequest.resourceName).toStrictEqual('Customer');
    expect(lastRequest.keyValue).toStrictEqual(undefined);
    expect(lastRequest.path).toStrictEqual([]);
  });

  it('Should create entity request', async function () {
    const url = new OpraURL('/Customer@123');
    const res = await request(server).get(url.toString());
    expect(res).toBeDefined();
    expect(res.status).toStrictEqual(200);
    expect(lastRequest).toBeDefined();
    if (!lastRequest) return;
    expect(lastRequest.resourceName).toStrictEqual('Customer');
    expect(lastRequest.keyValue).toStrictEqual('123');
    expect(lastRequest.path).toStrictEqual([]);
  });

  it('Should create entity request', async function () {
    const url = new OpraURL('/Customer@123/givenName');
    const res = await request(server).get(url.toString());
    expect(res).toBeDefined();
    expect(res.status).toStrictEqual(200);
    expect(lastRequest).toBeDefined();
    if (!lastRequest) return;
    expect(lastRequest.resourceName).toStrictEqual('Customer');
    expect(lastRequest.keyValue).toStrictEqual('123');
    expect(lastRequest.path).toStrictEqual([]);
  });

  it('Should handle collection request with options', async function () {
    const url = new OpraURL('/Customer?_limit=5&_skip=2');
    const res = await request(server).get(url.toString());
    expect(res).toBeDefined();
    expect(res.status).toStrictEqual(200);
    expect(lastRequest).toBeDefined();
    if (!lastRequest) return;
    expect(lastRequest.url.toString()).toStrictEqual(url.toString());
    expect(lastRequest.resourceName).toStrictEqual('Customer');
  });

});
