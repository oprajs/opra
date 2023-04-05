import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Inject, Injectable, InjectionToken, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpServiceBase, OpraHttpClient } from '@opra/client';
import { createMockServer } from '../../node-client/test/_support/create-mock-server.js';
import { OpraClientModule } from '../src/client.module.js';
import { OpraClientModuleOptions } from '../src/interfaces/module-options.interface.js';
import { createHttpRequestInterceptorMock } from './_support/http-mock.js';

class TestApi extends HttpServiceBase {
}

describe('OpraClientModule', function () {

  let app;
  let httpInterceptorProvider: Provider;
  const config: OpraClientModuleOptions = {
    serviceUrl: 'http://localhost',
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

  it('registerClient()', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.registerClient(config)],
      providers: [httpInterceptorProvider]
    }).compileComponents();

    const client = TestBed.inject(OpraHttpClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraHttpClient);
    expect(client.serviceUrl).toStrictEqual(app.baseUrl);
  });

  it('registerService()', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.registerService(TestApi, config)],
      providers: [httpInterceptorProvider]
    }).compileComponents();
    const service = TestBed.inject(TestApi);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(TestApi);
    expect(service.$client.serviceUrl).toBe(config.serviceUrl);
  });

  it('registerClientAsync() - useFactory', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.registerClientAsync({
          useFactory: () => config
        })],
      providers: [httpInterceptorProvider]
    }).compileComponents();
    const client = TestBed.inject(OpraHttpClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraHttpClient);
    expect(client.serviceUrl).toStrictEqual(app.baseUrl);
  });

  it('registerClientAsync() - useClass', async () => {
    class ConfigClass {
      constructor() {
        Object.assign(this, config);
      }
    }

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.registerClientAsync({
          useClass: ConfigClass
        })],
      providers: [httpInterceptorProvider]
    }).compileComponents();

    const client = TestBed.inject(OpraHttpClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraHttpClient);
    expect(client.serviceUrl).toStrictEqual(app.baseUrl);
  });

  it('registerClientAsync() - useFactory', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.registerServiceAsync(TestApi, {
          useFactory: () => config
        })],
      providers: [httpInterceptorProvider]
    }).compileComponents();
    const service = TestBed.inject(TestApi);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(TestApi);
    expect(service.$client.serviceUrl).toBe(config.serviceUrl);
  });

  it('registerServiceAsync() - useClass', async () => {
    class ConfigClass {
      constructor() {
        Object.assign(this, config);
      }
    }

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.registerServiceAsync(TestApi, {
          useClass: ConfigClass
        })],
      providers: [httpInterceptorProvider]
    }).compileComponents();
    const service = TestBed.inject(TestApi);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(TestApi);
    expect(service.$client.serviceUrl).toBe(config.serviceUrl);
  });

  it('Should register multiple clients', async () => {
    const CLIENT2 = new InjectionToken('client2');

    @Injectable()
    class TestComponent {
      constructor(public client1: OpraHttpClient,
                  @Inject(CLIENT2) public client2: OpraHttpClient,
      ) {
      }
    }

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.registerClient(config),
        OpraClientModule.registerClient({...config, token: CLIENT2}),
      ],
      providers: [
        httpInterceptorProvider,
        TestComponent
      ]
    }).compileComponents();
    const test = TestBed.inject(TestComponent);
    expect(test).toBeDefined();
    expect(test.client1).toBeDefined();
    expect(test.client2).toBeDefined();
    expect(test.client1).not.toBe(test.client2);
  });

  it('Should register multiple services', async () => {
    const SERVICE2 = new InjectionToken('service2');

    @Injectable()
    class TestComponent {
      constructor(public api1: TestApi,
                  @Inject(SERVICE2) public api2: TestApi,
      ) {
      }
    }

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.registerService(TestApi, config),
        OpraClientModule.registerService(TestApi, {...config, token: SERVICE2}),
      ],
      providers: [
        httpInterceptorProvider,
        TestComponent
      ]
    }).compileComponents();
    const test = TestBed.inject(TestComponent);
    expect(test).toBeDefined();
    expect(test.api1).toBeDefined();
    expect(test.api2).toBeDefined();
    expect(test.api1).not.toBe(test.api2);
    expect(test.api1.$client).not.toBe(test.api2.$client);
  });

});
