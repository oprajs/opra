import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Inject, Injectable, InjectionToken, } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { kClient } from '@opra/client';
import { createMockServer } from '../../client/test/_support/create-mock-server.js';
import { OpraAngularClient } from '../src/angular-client.js';
import { OpraClientModule } from '../src/client.module.js';
import { OpraClientModuleOptions } from '../src/interfaces/module-options.interface.js';

class TestApi {
}

describe('OpraClientModule', function () {

  let app;
  let config: OpraClientModuleOptions;

  afterAll(() => app.server.close());

  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    app = await createMockServer();
    config = {serviceUrl: app.baseUrl};
  });

  it('registerClient()', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.registerClient(config)]
    }).compileComponents();

    const client = TestBed.inject(OpraAngularClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraAngularClient);
    expect(client.serviceUrl).toStrictEqual(app.baseUrl);
  });

  it('registerService()', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.registerService(TestApi, config)],
    }).compileComponents();
    const service = TestBed.inject(TestApi);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(TestApi);
  });

  it('registerClientAsync() - useFactory', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.registerClientAsync({
          useFactory: () => config
        })]
    }).compileComponents();
    const client = TestBed.inject(OpraAngularClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraAngularClient);
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
        })]
    }).compileComponents();

    const client = TestBed.inject(OpraAngularClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OpraAngularClient);
    expect(client.serviceUrl).toStrictEqual(app.baseUrl);
  });

  it('registerClientAsync() - useFactory', async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpraClientModule.registerServiceAsync(TestApi, {
          useFactory: () => config
        })]
    }).compileComponents();
    const service = TestBed.inject(TestApi);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(TestApi);
    expect(service[kClient].serviceUrl).toBe(config.serviceUrl);
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
        })]
    }).compileComponents();
    const service = TestBed.inject(TestApi);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(TestApi);
    expect(service[kClient].serviceUrl).toBe(config.serviceUrl);
  });

  it('Should register multiple clients', async () => {
    const CLIENT2 = new InjectionToken('client2');

    @Injectable()
    class TestComponent {
      constructor(public client1: OpraAngularClient,
                  @Inject(CLIENT2) public client2: OpraAngularClient,
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
        TestComponent
      ]
    }).compileComponents();
    const test = TestBed.inject(TestComponent);
    expect(test).toBeDefined();
    expect(test.api1).toBeDefined();
    expect(test.api2).toBeDefined();
    expect(test.api1).not.toBe(test.api2);
    expect(test.api1[kClient]).not.toBe(test.api2[kClient]);
  });

});
