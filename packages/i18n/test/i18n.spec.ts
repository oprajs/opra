import path from 'path';
import {i18n, translate} from '../src';

describe('I18n', function () {

  afterEach(() => i18n.changeLanguage('en'));

  beforeAll(async () => {
    i18n.registerLocaleDir(path.join(__dirname, '_support/locale'));
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
      resourceDirs: [path.join(__dirname, '_support/locale2')]
    })
  });

  it('Should translate nested text', async () => {
    expect(i18n.any(translate('HELLO', {name: 'John'}))).toStrictEqual('Hello John');
    expect(i18n.any(null)).toStrictEqual(null);
  })

  it('Should translate to fallback string if key not found', async () => {
    expect(i18n.any(translate('HI', {name: 'John'}, 'Hi (there)'))).toStrictEqual('Hi (there)');
  })

  it('Should translate key using "any" method', async () => {
    expect(i18n.any('$t(HELLO)', {name: 'John'})).toStrictEqual('Hello John');
    expect(i18n.any(null)).toStrictEqual(null);
  })

  it('Should translate text using "any" method', async () => {
    expect(i18n.any('$t(HELLO). How are you', {name: 'John'})).toStrictEqual('Hello John. How are you');
  })

  it('Should translate array using "any" method', async () => {
    expect(i18n.any(['HELLO', '$t(HELLO). How are you'], {name: 'John'}))
      .toStrictEqual(['HELLO', 'Hello John. How are you']);
  })

  it('Should translate object using "any" method', async () => {
    expect(i18n.any({a: 'HELLO', b: '$t(HELLO). How are you'}, {name: 'John'}))
      .toStrictEqual({a: 'HELLO', b: 'Hello John. How are you'});
  })

  it('Should "any" method translate Translating object within an object', async () => {
    expect(i18n.any({
      a: translate('HELLO', {name: 'Jena'}),
      b: translate('HELLO', {name: 'Mike'}),
      c: null,
      d: 1
    }))
      .toStrictEqual({a: 'Hello Jena', b: 'Hello Mike', c: null, d: 1});
  })

  it('Should "any" method ignore built-in objects', async () => {
    const input = [Buffer.from(''), () => 0, Symbol('x'), /a/,
      new Map(), new Set(), new WeakMap(), new WeakSet()];
    expect(i18n.any(input))
      .toStrictEqual(input);
  })

  it('Should "any" method ignore key using custom function', async () => {
    const input = ['$t(ok)', '$t(OK)'];
    await i18n.changeLanguage('tr');
    expect(i18n.any(input, {ignore: (v) => v === '$t(OK)'}))
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
    expect(i18n.any(src1, {name: 'John'}))
      .toStrictEqual(dst1);
  })

  it('Should add "lowercase" formatter', async () => {
    expect(i18n.any('$t(OK, lowercase)')).toStrictEqual('ok');
  })

  it('Should add "uppercase" formatter', async () => {
    expect(i18n.any('$t(ok, uppercase)')).toStrictEqual('OK');
  })

  it('Should add "upperFirst" formatter', async () => {
    expect(i18n.any('$t(ok, upperFirst)')).toStrictEqual('Ok');
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

