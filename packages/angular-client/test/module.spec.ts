import express, { Express } from 'express';
import { Server } from 'http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OpraClient } from '@opra/client';
import { OpraExpressAdapter } from '@opra/core';
import { OpraDocument } from '@opra/schema';
import { createTestDocument } from '../../core/test/_support/test-app/create-document.js';
import { OpraClientModule } from '../src/client.module.js';
import { InjectOpraClient } from '../src/index.js';
import { createHttpRequestInterceptorMock } from './_support/http-mock.js';

describe('OpraClientModule', function () {

  let api: OpraDocument;
  let app: Express;
  let server: Server;
  let httpInterceptorProvider: Provider;
  const config = {
    serviceUrl: 'http://localhost:8080'
  };

  beforeAll(async () => {
    api = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, api);
    server = app.listen(8080);
    httpInterceptorProvider = {
      provide: HTTP_INTERCEPTORS,
      useClass: createHttpRequestInterceptorMock(app),
      multi: true
    };
  });

  afterAll(async () => {
    server.close();
  })

  it('forRoot(config)', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.forRoot(config)],
      providers: [httpInterceptorProvider]
    }).compileComponents();

    const client = TestBed.inject(OpraClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraClient);
    expect(client.serviceUrl).toStrictEqual('http://localhost:8080');
    await client.init();
    expect(client.initialized).toStrictEqual(true);
  });

  it('forRoot(config)', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.forRoot({
          serviceUrl: 'http://localhost:8080'
        })],
      providers: [httpInterceptorProvider]
    }).compileComponents();

    const client = TestBed.inject(OpraClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraClient);
    expect(client.serviceUrl).toStrictEqual('http://localhost:8080');
    await client.init();
    expect(client.initialized).toStrictEqual(true);
  });

  it('forRootAsync() - useFactory', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.forRootAsync({
          useFactory: () => config
        })],
      providers: [httpInterceptorProvider]
    }).compileComponents();

    const client = TestBed.inject(OpraClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraClient);
    expect(client.serviceUrl).toStrictEqual('http://localhost:8080');
    await client.init();
    expect(client.initialized).toStrictEqual(true);
  });


  it('forRootAsync() - useClass', async () => {
    class ConfigClass {
      constructor() {
        Object.assign(this, config);
      }
    }

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.forRootAsync({
          useClass: ConfigClass
        })],
      providers: [httpInterceptorProvider]
    }).compileComponents();

    const client = TestBed.inject(OpraClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraClient);
    expect(client.serviceUrl).toStrictEqual('http://localhost:8080');
    await client.init();
    expect(client.initialized).toStrictEqual(true);
  });

  it('Should register multiple clients', async () => {
    @Injectable()
    class TesComponent {
      constructor(public client: OpraClient,
                  @InjectOpraClient('client2') public client2: OpraClient) {
      }
    }

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.forRoot(config),
        OpraClientModule.forRoot({...config, name: 'client2'}),
      ],
      providers: [
        httpInterceptorProvider,
        TesComponent
      ]
    }).compileComponents();


    const test = TestBed.inject(TesComponent);
    expect(test).toBeDefined();
    expect(test.client).toBeDefined();
    expect(test.client2).toBeDefined();
    expect(test.client).not.toBe(test.client2);
  });

});
