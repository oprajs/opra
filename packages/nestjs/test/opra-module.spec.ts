import i18next from 'i18next';
import {Test} from '@nestjs/testing';
import {ApplicationModule} from './_support/test-app/app.module';
import {AsyncApplicationModule} from './_support/test-app/app-async.module';
import {AsyncOptionsClassModule} from './_support/test-app/async-class-options.module';
import {AsyncOptionsExistingModule} from './_support/test-app/async-existing-options.module';
import {AsyncOptionsFactoryModule} from './_support/test-app/async-factory.module';

describe('OpraModule', function () {

  it('Should initialize using OpraModule.forRoot()', async function () {
    let ok = false;
    i18next.on('initialized', () => ok = true);
    const module = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();
    const app = module.createNestApplication();
    await app.init();
    expect(ok).toStrictEqual(true)
    await app.close();
  });

  it('Should initialize within DynamicModule using OpraModule.forRoot()', async function () {
    let ok = false;
    i18next.on('initialized', () => ok = true);
    const module = await Test.createTestingModule({
      imports: [AsyncApplicationModule],
    }).compile();
    const app = module.createNestApplication();
    await app.init();
    expect(ok).toStrictEqual(true);
    await app.close();
  });

  it('Should initialize using OpraModule.forRootAsync() - useClass', async function () {
    let ok = false;
    i18next.on('initialized', () => ok = true);
    const module = await Test.createTestingModule({
      imports: [AsyncOptionsClassModule],
    }).compile();
    const app = module.createNestApplication();
    await app.init();
    expect(ok).toStrictEqual(true);
    await app.close();
  });

  it('Should initialize using OpraModule.forRootAsync() - useExisting', async function () {
    let ok = false;
    i18next.on('initialized', () => ok = true);
    const module = await Test.createTestingModule({
      imports: [AsyncOptionsExistingModule],
    }).compile();
    const app = module.createNestApplication();
    await app.init();
    expect(ok).toStrictEqual(true);
    await app.close();
  });

  it('Should initialize using OpraModule.forRootAsync() - useFactory', async function () {
    let ok = false;
    i18next.on('initialized', () => ok = true);
    const module = await Test.createTestingModule({
      imports: [AsyncOptionsFactoryModule],
    }).compile();
    const app = module.createNestApplication();
    await app.init();
    expect(ok).toStrictEqual(true);
    await app.close();
  });

});
