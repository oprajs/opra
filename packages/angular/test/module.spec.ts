import express, { Express } from 'express';
import { Server } from 'http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Inject, Injectable, InjectionToken, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OpraHttpClient } from '@opra/client';
import { OpraDocument } from '@opra/common';
import { OpraExpressAdapter } from '@opra/core';
import { createTestDocument } from '../../core/test/_support/test-app/create-document.js';
import { OpraClientModule } from '../src/client.module.js';
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

    const client = TestBed.inject(OpraHttpClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraHttpClient);
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

    const client = TestBed.inject(OpraHttpClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraHttpClient);
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

    const client = TestBed.inject(OpraHttpClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraHttpClient);
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

    const client = TestBed.inject(OpraHttpClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraHttpClient);
    expect(client.serviceUrl).toStrictEqual('http://localhost:8080');
    await client.init();
    expect(client.initialized).toStrictEqual(true);
  });

  it('Should register multiple clients', async () => {
    const CLIENT2 = new InjectionToken('opra_client2');

    @Injectable()
    class TesComponent {
      constructor(public client: OpraHttpClient,
                  @Inject(CLIENT2) public client2: OpraHttpClient
      ) {
      }
    }

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.forRoot(config),
        OpraClientModule.forRoot({serviceUrl: 'http://localhost:8081', token: CLIENT2}),
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
