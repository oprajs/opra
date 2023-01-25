import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Inject, Injectable, InjectionToken, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OpraHttpClient } from '@opra/client';
import { createMockServer } from '../../node-client/test/_support/create-mock-server.js';
import { OpraClientModule } from '../src/client.module.js';
import { OpraClientModuleOptions } from '../src/interfaces/module-options.interface.js';
import { createHttpRequestInterceptorMock } from './_support/http-mock.js';

class TestApi {
  constructor(public client) {
  }
}

describe('OpraClientModule', function () {

  let app;
  let httpInterceptorProvider: Provider;
  const config: OpraClientModuleOptions = {
    serviceUrl: 'http://localhost',
    serviceClass: TestApi
  };

  afterAll(() => app.server.close());

  beforeAll(async () => {
    app = await createMockServer();
    config.serviceUrl = app.baseUrl;
  });

  beforeAll(async () => {
    httpInterceptorProvider = {
      provide: HTTP_INTERCEPTORS,
      useClass: createHttpRequestInterceptorMock(app),
      multi: true
    };
  });

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
    expect(client.serviceUrl).toStrictEqual(app.baseUrl);
    await client.init();
    expect(client.initialized).toStrictEqual(true);
    const service = TestBed.inject(TestApi);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(TestApi);
    expect(service.client).toBe(client);
  });

  it('forRootAsync() - useFactory', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.forRootAsync({
          serviceClass: TestApi,
          useFactory: () => config
        })],
      providers: [httpInterceptorProvider]
    }).compileComponents();

    const client = TestBed.inject(OpraHttpClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraHttpClient);
    expect(client.serviceUrl).toStrictEqual(app.baseUrl);
    await client.init();
    expect(client.initialized).toStrictEqual(true);
    const service = TestBed.inject(TestApi);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(TestApi);
    expect(service.client).toBe(client);
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
          serviceClass: TestApi,
          useClass: ConfigClass
        })],
      providers: [httpInterceptorProvider]
    }).compileComponents();

    const client = TestBed.inject(OpraHttpClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraHttpClient);
    expect(client.serviceUrl).toStrictEqual(app.baseUrl);
    await client.init();
    expect(client.initialized).toStrictEqual(true);
    const service = TestBed.inject(TestApi);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(TestApi);
    expect(service.client).toBe(client);
  });

  it('Should register multiple clients', async () => {
    const CLIENT2 = new InjectionToken('client2');
    const SERVICE2 = new InjectionToken('service2');

    @Injectable()
    class TesComponent {
      constructor(public client: OpraHttpClient,
                  public api: TestApi,
                  @Inject(CLIENT2) public client2: OpraHttpClient,
                  @Inject(SERVICE2) public api2: TestApi,
      ) {
      }
    }

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.forRoot(config),
        OpraClientModule.forRoot({...config, clientToken: CLIENT2, serviceToken: SERVICE2}),
      ],
      providers: [
        httpInterceptorProvider,
        TesComponent
      ]
    }).compileComponents();


    const test = TestBed.inject(TesComponent);
    expect(test).toBeDefined();
    expect(test.client).toBeDefined();
    expect(test.api).toBeDefined();
    expect(test.client2).toBeDefined();
    expect(test.api2).toBeDefined();
    expect(test.client).not.toBe(test.client2);
    expect(test.api).not.toBe(test.api2);
  });

});
