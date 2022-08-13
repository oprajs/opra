import { Opaque } from 'ts-gems';
import { HttpHeaders } from '../enums';

export type HeadersObject = Opaque<Record<string, any>, 'HeadersObject'>;

const wellKnownHeaders = Object.values(HttpHeaders)
    .reduce((target, k) => {
      target[k.toLowerCase()] = k;
      return target;
    }, {});

const wrapKey = (prop: string | symbol): string | symbol => {
  return typeof prop == 'string' ? wellKnownHeaders[prop.toLowerCase()] || prop : prop;
}
/**
 * Create a proxy that ensures header keys are always formatted according to well known header names
 */
export namespace Headers {
  export function from(obj: object): HeadersObject {
    const headers = create();
    for (const [k, v] of Object.entries(obj))
      headers[k] = v;
    return headers;
  }

  export function create(): HeadersObject {

    return new Proxy({}, {

      set: (target: object, prop: string | symbol, value: any, receiver: any): boolean => {
        let key = prop;
        if (typeof key === 'string')
          key = wellKnownHeaders[key.toLowerCase()] || key;
        const result = Reflect.set(target, key, value, receiver);
        /*  istanbul ignore next */
        if (!result && Object.isFrozen(target))
          throw new TypeError('Cannot add property, object is not extensible');
        return result;
      },

      get: (target, prop, receiver) => {
        return Reflect.get(target, wrapKey(prop), receiver);
      },

      deleteProperty: (target, prop): boolean => {
        return Reflect.deleteProperty(target, wrapKey(prop));
      },

      defineProperty: (target, prop, descriptor): boolean => {
        let key = prop;
        if (typeof key === 'string')
          key = wellKnownHeaders[key.toLowerCase()] || key;
        return Reflect.defineProperty(target, key, descriptor);
      },

      getOwnPropertyDescriptor: (target, prop): PropertyDescriptor | undefined => {
        return Reflect.getOwnPropertyDescriptor(target, wrapKey(prop));
      },

      has: (target, prop): boolean => {
        return Reflect.has(target, wrapKey(prop));
      }

    }) as HeadersObject;

  }
}
