import {fileURLToPath} from 'node:url';
import path from 'path';
import {i18n, translate} from '../../src/index.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

describe('I18n', function () {

  beforeAll(async () => {
    i18n.registerLocaleDir(path.join(dirname, '_support/locale'));
    await i18n.init({
      defaultNS: 'translate',
      lng: 'en',
      resources: {
        en: {
          translate: {
            'HELLO': 'Hello {{name}}',
            'ok': 'ok',
            'OK': 'OK',
          }
        },
        fr: {
          translate: {
            'HELLO': 'Bonjour {{name}}',
          }
        }
      },
      resourceDirs: [path.join(dirname, '_support/locale2')]
    })
  });

  beforeEach(() => i18n.changeLanguage('en'));

  it('Should translate nested text', async () => {
    expect(i18n.deep(translate('HELLO', {name: 'John'}))).toStrictEqual('Hello John');
    expect(i18n.deep(null)).toStrictEqual(null);
  })

  it('Should translate to fallback string if key not found', async () => {
    expect(i18n.deep(translate('HI', {name: 'John'}, 'Hi (there)'))).toStrictEqual('Hi (there)');
    expect(i18n.deep('$t(error:INTERNAL_SERVER_ERROR?Internal server error)')).toStrictEqual('Internal server error');
  })

  it('Should translate text using "deep" method', async () => {
    expect(i18n.deep('$t(HELLO). How are you', {name: 'John'})).toStrictEqual('Hello John. How are you');
  })

  it('Should translate array using "deep" method', async () => {
    expect(i18n.deep(['HELLO', '$t(HELLO). How are you'], {name: 'John'}))
      .toStrictEqual(['HELLO', 'Hello John. How are you']);
  })

  it('Should translate object using "deep" method', async () => {
    expect(i18n.deep({a: 'HELLO', b: '$t(HELLO). How are you'}, {name: 'John'}))
      .toStrictEqual({a: 'HELLO', b: 'Hello John. How are you'});
  })

  it('Should "deep" method translate Translating object within an object', async () => {
    expect(i18n.deep({
      a: translate('HELLO', {name: 'Jena'}),
      b: translate('HELLO', {name: 'Mike'}),
      c: null,
      d: 1
    }))
      .toStrictEqual({a: 'Hello Jena', b: 'Hello Mike', c: null, d: 1});
  })

  it('Should "deep" method ignore built-in objects', async () => {
    const input = [Buffer.from(''), () => 0, Symbol('x'), /a/,
      new Map(), new Set(), new WeakMap(), new WeakSet()];
    expect(i18n.deep(input))
      .toStrictEqual(input);
  })

  it('Should "deep" method ignore key using custom function', async () => {
    const input = ['$t(ok)', '$t(OK)'];
    await i18n.changeLanguage('tr');
    expect(i18n.deep(input, {ignore: (v) => v === '$t(OK)'}))
      .toStrictEqual(['tamam', '$t(OK)']);
  })

  it('Should handle circular referenced objects', async () => {
    const src1: any = {a: 'HELLO'};
    const src2: any = {b: '$t(HELLO). How are you'};
    src1.b = src2;
    src2.a = src1;
    const dst1: any = {a: 'HELLO'};
    const dst2: any = {b: 'Hello John. How are you'};
    dst1.b = dst2;
    dst2.a = dst1;
    expect(i18n.deep(src1, {name: 'John'}))
      .toStrictEqual(dst1);
  })

  it('Should add "lowercase" formatter', async () => {
    expect(i18n.deep('$t(OK, lowercase)')).toStrictEqual('ok');
  })

  it('Should add "uppercase" formatter', async () => {
    expect(i18n.deep('$t(ok, uppercase)')).toStrictEqual('OK');
  })

  it('Should add "upperFirst" formatter', async () => {
    expect(i18n.deep('$t(ok, upperFirst)')).toStrictEqual('Ok');
  })

  it('Should load global registered locale directories', async () => {
    await i18n.changeLanguage('tr');
    expect(i18n.t('HELLO', {name: 'John'})).toStrictEqual('Merhaba John');
  })

  it('Should load given locale directories', async () => {
    await i18n.changeLanguage('tr');
    expect(i18n.t('OK')).toStrictEqual('TAMAM');
  })

});
