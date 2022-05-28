import '../src';
import i18next from 'i18next';
import path from 'path';
import {Translating} from '../src';

describe('I18next module augmentation', function () {

  afterEach(() => i18next.changeLanguage('en'));

  beforeAll(async () => {
    i18next.registerLocaleDir(path.join(__dirname, '_support/locale'));
    await i18next.init({
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
            'HELLO': 'Bonjour {{name}}'
          }
        }
      },
      resourceDirs: [path.join(__dirname, '_support/locale2')]
    })
  });

  it('Should add "deep" method to i18next', async () => {
    expect(i18next.deep).toBeInstanceOf(Function);
  })

  it('Should translate key using "deep" method', async () => {
    expect(i18next.deep('HELLO', {name: 'John'})).toStrictEqual('Hello John');
    expect(i18next.deep(null)).toStrictEqual(null);
  })

  it('Should translate text using "deep" method', async () => {
    expect(i18next.deep('$t(HELLO). How are you', {name: 'John'})).toStrictEqual('Hello John. How are you');
  })

  it('Should translate array using "deep" method', async () => {
    expect(i18next.deep(['HELLO', '$t(HELLO). How are you'], {name: 'John'}))
      .toStrictEqual(['Hello John', 'Hello John. How are you']);
  })

  it('Should translate object using "deep" method', async () => {
    expect(i18next.deep({a: 'HELLO', b: '$t(HELLO). How are you'}, {name: 'John'}))
      .toStrictEqual({a: 'Hello John', b: 'Hello John. How are you'});
  })

  it('Should "deep" method translate Translating object within an object', async () => {
    expect(i18next.deep({
      a: Translating('$t(HELLO)', {name: 'Jena'}),
      b: Translating('$t(HELLO)', {name: 'Mike'}),
      c: null,
      d: 1
    }))
      .toStrictEqual({a: 'Hello Jena', b: 'Hello Mike', c: null, d: 1});
  })

  it('Should "deep" method ignore built-in objects', async () => {
    const input = [Buffer.from(''), () => 0, Symbol('x'), /a/,
      new Map(), new Set(), new WeakMap(), new WeakSet()];
    expect(i18next.deep(input))
      .toStrictEqual(input);
  })

  it('Should "deep" method ignore using custom function', async () => {
    const input = ['ok', 'OK'];
    await i18next.changeLanguage('tr');
    expect(i18next.deep(input, {ignore: (v) => v === 'OK'}))
      .toStrictEqual(['tamam', 'OK']);
  })

  it('Should handle circular referenced objects', async () => {
    const src1: any = {a: 'HELLO'};
    const src2: any = {b: '$t(HELLO). How are you'};
    src1.b = src2;
    src2.a = src1;
    const dst1: any = {a: 'Hello John'};
    const dst2: any = {b: 'Hello John. How are you'};
    dst1.b = dst2;
    dst2.a = dst1;
    expect(i18next.deep(src1, {name: 'John'}))
      .toStrictEqual(dst1);
  })

  it('Should add "lowercase" formatter', async () => {
    expect(i18next.deep('$t(OK, lowercase)')).toStrictEqual('ok');
  })

  it('Should add "uppercase" formatter', async () => {
    expect(i18next.deep('$t(ok, uppercase)')).toStrictEqual('OK');
  })

  it('Should add "upperFirst" formatter', async () => {
    expect(i18next.deep('$t(ok, upperFirst)')).toStrictEqual('Ok');
  })

  it('Should load global registered locale directories', async () => {
    await i18next.changeLanguage('tr');
    expect(i18next.t('HELLO', {name: 'John'})).toStrictEqual('Merhaba John');
  })

  it('Should load given locale directories', async () => {
    await i18next.changeLanguage('tr');
    expect(i18next.t('OK')).toStrictEqual('TAMAM');

  })

});

