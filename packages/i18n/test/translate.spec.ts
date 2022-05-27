import i18next from 'i18next';
import {Translating} from '../src';

describe('TranslatedString', function () {

  const initConfig = {
    defaultNS: 'translate',
    lng: 'en',
    resources: {
      en: {
        translate: {
          'HELLO': 'Hello {{name}}'
        }
      },
      de: {
        translate: {
          'HELLO': 'Hallo {{name}}'
        }
      }
    }
  }

  beforeAll(async () => {
    await i18next.init(initConfig);
  })

  it('Should create Translated instance with "new" keyword', () => {
    let t = new Translating('HELLO');
    expect(t).toBeInstanceOf(Translating);
    expect(t.key).toStrictEqual('HELLO');
    t = new Translating(['HELLO', 'Hello there']);
    expect(t.key).toStrictEqual(['HELLO', 'Hello there']);
    t = new Translating('HELLO', {name: 'John'});
    expect(t.key).toStrictEqual('HELLO');
    expect(t.options).toStrictEqual({name: 'John'});
  })

  it('Should create Translated instance without "new" keyword', () => {
    let t = Translating('HELLO');
    expect(t).toBeInstanceOf(Translating);
    expect(t.key).toStrictEqual('HELLO');
    t = Translating(['HELLO', 'Hello there']);
    expect(t.key).toStrictEqual(['HELLO', 'Hello there']);
    t = Translating('HELLO', {name: 'John'});
    expect(t.key).toStrictEqual('HELLO');
    expect(t.options).toStrictEqual({name: 'John'});
  })

  it('Should translate string using default i18n instance', async () => {
    const t = Translating('HELLO', {name: 'John'});
    expect('' + t).toStrictEqual('Hello John');
    await i18next.changeLanguage('de');
    expect('' + t).toStrictEqual('Hallo John');
  })

  it('Should set i18n instance to use for translate', async () => {
    const inst = i18next.createInstance();
    await inst.init({
      defaultNS: 'translate',
      lng: 'fr',
      resources: {
        en: {
          translate: {
            'HELLO': 'Hello {{name}}'
          }
        },
        fr: {
          translate: {
            'HELLO': 'Bonjour {{name}}'
          }
        }
      }
    })
    Translating.setI18n(inst);
    const t = Translating('HELLO', {name: 'John'});
    expect('' + t).toStrictEqual('Bonjour John');
    Translating.setI18n(i18next);
  })

});

