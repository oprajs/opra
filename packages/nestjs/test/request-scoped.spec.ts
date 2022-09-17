import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CatsResource } from './_support/request-scoped-app/cats.resource.js';
import { HelloModule } from './_support/request-scoped-app/hello.module.js';
import { Interceptor } from './_support/request-scoped-app/logging.interceptor.js';
import { Guard } from './_support/request-scoped-app/request-scoped.guard.js';
import { UsersService } from './_support/request-scoped-app/users.service.js';

class Meta {
  static COUNTER = 0;

  constructor() {
    Meta.COUNTER++;
  }
}

describe('Request scope', () => {
  let server;
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        HelloModule.forRoot({
          provide: 'META',
          useClass: Meta,
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  describe('when one service is request scoped', () => {
    beforeAll(async () => {
      const performHttpCall = (end) =>
          request(server)
              .get('/Cats@1')
              .expect(200)
              .end((err) => {
                if (err) return end(err);
                end();
              });
      await new Promise((resolve) => performHttpCall(resolve));
      await new Promise((resolve) => performHttpCall(resolve));
      await new Promise((resolve) => performHttpCall(resolve));
    });

    it(`should create resource controller for each request`, async () => {
      expect(CatsResource.COUNTER).toEqual(3);
    });

    it(`should create service for each request`, async () => {
      expect(UsersService.COUNTER).toEqual(3);
    });

    it(`should share static provider across requests`, async () => {
      expect(Meta.COUNTER).toEqual(1);
    });

    it(`should create request scoped interceptor for each request`, async () => {
      expect(Interceptor.COUNTER).toEqual(3);
      expect(Interceptor.REQUEST_SCOPED_DATA).toEqual([1, 1, 1]);
    });

    it(`should create request scoped guard for each request`, async () => {
      expect(Guard.COUNTER).toEqual(3);
      expect(Guard.REQUEST_SCOPED_DATA).toEqual([1, 1, 1]);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
