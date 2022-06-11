/* eslint-disable import/no-named-as-default-member */
import i18next from 'i18next';
import {isTranslation, Translation} from '../src';

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
    let t = new Translation('HELLO');
    expect(isTranslation(t)).toStrictEqual(true);
    expect(t).toBeInstanceOf(Translation);
    expect(t.key).toStrictEqual('HELLO');
    t = new Translation(['HELLO', 'Hello there']);
    expect(t.key).toStrictEqual(['HELLO', 'Hello there']);
    t = new Translation('HELLO', {name: 'John'});
    expect(t.key).toStrictEqual('HELLO');
    expect(t.options).toStrictEqual({name: 'John'});
  })

  it('Should create Translated instance without "new" keyword', () => {
    let t = Translation('HELLO');
    expect(t).toBeInstanceOf(Translation);
    expect(t.key).toStrictEqual('HELLO');
    t = Translation(['HELLO', 'Hello there']);
    expect(t.key).toStrictEqual(['HELLO', 'Hello there']);
    t = Translation('HELLO', {name: 'John'});
    expect(t.key).toStrictEqual('HELLO');
    expect(t.options).toStrictEqual({name: 'John'});
  })

  it('Should return default string if key not found', async () => {
    const t = Translation('UNKNOWN_KEY', 'Key not found');
    expect('' + t).toStrictEqual('Key not found');
  })

  it('Should translate string using default i18n instance', async () => {
    const t = Translation('HELLO', {name: 'John'});
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
    Translation.setI18n(inst);
    const t = Translation('HELLO', {name: 'John'});
    expect('' + t).toStrictEqual('Bonjour John');
    Translation.setI18n(i18next);
  })

});

