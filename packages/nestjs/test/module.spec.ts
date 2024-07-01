import { INestApplication } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { OpraNestAdapter } from '@opra/nestjs';
import { TestModule } from './_support/customer-app/test.module.js';

describe('OpraModule', () => {
  let nestApplication: INestApplication;
  let moduleRef: ModuleRef;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    nestApplication = module.createNestApplication();
    nestApplication.setGlobalPrefix('api');
    await nestApplication.init();
    moduleRef = nestApplication.get(ModuleRef);
  });

  afterEach(async () => {
    await nestApplication.close();
  });

  it('Should register OpraNestAdapter', async () => {
    const adapter = moduleRef.get(OpraNestAdapter, { strict: false });
    expect(adapter).toBeDefined();
    expect(adapter.document).toBeDefined();
    expect(adapter.nestControllers.length).toBeGreaterThan(0);
  });
});
