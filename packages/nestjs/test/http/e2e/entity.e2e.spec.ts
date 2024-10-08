import '@opra/sqb';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { entityTests } from '@opra/http/test/e2e/tests/index';
import { OpraTestClient } from '@opra/testing';
import { TestModule } from '../../_support/http-customer-app/test.module.js';

describe('e2e tests', function () {
  let client: OpraTestClient;
  const testArgs: any = {};
  let nestApplication: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    nestApplication = module.createNestApplication();
    nestApplication.setGlobalPrefix('api');
    await nestApplication.init();
    const server = nestApplication.getHttpServer();
    client = new OpraTestClient(server, { basePath: '/api' });
    testArgs.client = client;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  // @ts-ignore
  entityTests.call(this, testArgs);
});
