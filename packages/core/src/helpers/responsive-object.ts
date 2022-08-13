import { Opaque } from 'ts-gems';

export type ResponsiveObject<T> = Opaque<Record<string, T>, 'ResponsiveObject'>;

export function Responsive<T>(wrapped?: Record<string, T>): ResponsiveObject<T> {
  wrapped = wrapped || {};
  const keyMap: Record<string, string> = {};
  Object.keys(wrapped).forEach(k => keyMap[k.toLowerCase()] = k);
  const wrapKey = (prop: string | symbol): string | symbol => {
    return typeof prop == 'string' ? keyMap[prop.toLowerCase()] : prop;
  }

  return new Proxy(wrapped, {

    set: (target: object, prop: string | symbol, value: any, receiver: any): boolean => {
      let key = prop;
      if (typeof key === 'string') {
        const keyLower = key.toLowerCase();
        key = keyMap[keyLower] = keyMap[keyLower] || key;
      }
      const result = Reflect.set(target, key, value, receiver);
      if (!result && Object.isFrozen(target))
        throw new TypeError('Cannot add property, object is not extensible');
      return result;
    },

    get: (target, prop, receiver) => {
      return Reflect.get(target, wrapKey(prop), receiver);
    },

    deleteProperty: (target, prop): boolean => {
      const key = wrapKey(prop);
      if (typeof prop === 'string') {
        delete keyMap[prop.toLowerCase()];
      }
      return Reflect.deleteProperty(target, key);
    },

    defineProperty: (target, prop, descriptor): boolean => {
      let key = prop;
      if (typeof key === 'string') {
        const keyLower = key.toLowerCase();
        key = keyMap[keyLower] = keyMap[keyLower] || key;
      }
      return Reflect.defineProperty(target, key, descriptor);
    },

    getOwnPropertyDescriptor: (target, prop): PropertyDescriptor | undefined => {
      return Reflect.getOwnPropertyDescriptor(target, wrapKey(prop));
    },

    has: (target, prop): boolean => {
      return Reflect.has(target, wrapKey(prop));
    }

  }) as ResponsiveObject<T>;
}
