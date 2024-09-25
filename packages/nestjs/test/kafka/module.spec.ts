import { INestApplication } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { OpraKafkaNestjsAdapter } from '@opra/nestjs';
import { TestModule } from '../_support/rpc-customer-app/test.module.js';

describe('OpraModule', () => {
  let nestApplication: INestApplication;
  let moduleRef: ModuleRef;
  let spy: jest.SpyInstance;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    nestApplication = module.createNestApplication();
    /** Prevent connection to server */
    spy = jest.spyOn(OpraKafkaNestjsAdapter.prototype, 'start').mockResolvedValue();
    await nestApplication.init();
    moduleRef = nestApplication.get(ModuleRef);
  });

  afterEach(async () => {
    await nestApplication.close();
    spy.mockRestore();
  });

  it('Should register OpraNestAdapter', async () => {
    const adapter = moduleRef.get(OpraKafkaNestjsAdapter, { strict: false });
    expect(adapter).toBeDefined();
    expect(adapter.document).toBeDefined();
    expect(adapter.document.api).toBeDefined();
    expect(Array.from(adapter.document.rpcApi.controllers.keys())).toEqual(['Mail']);
  });
});
