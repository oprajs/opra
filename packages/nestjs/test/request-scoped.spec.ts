import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CatsController } from './_support/request-scoped-app/cats.controller.js';
import { CatsService } from './_support/request-scoped-app/cats.service.js';
import { HelloModule } from './_support/request-scoped-app/hello.module.js';
import { Interceptor } from './_support/request-scoped-app/logging.interceptor.js';
import { Guard } from './_support/request-scoped-app/request-scoped.guard.js';

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
      const performHttpCall = () => request(server).get('/Cats@1').expect(200).send();
      await performHttpCall();
      await performHttpCall();
      await performHttpCall();
    });

    it(`should create resource controller for each request`, async () => {
      expect(CatsController.COUNTER).toEqual(3);
    });

    it(`should create service for each request`, async () => {
      expect(CatsService.COUNTER).toEqual(3);
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
