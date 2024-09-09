import type { Type } from 'ts-gems';

export function mergePrototype(targetProto: any, baseProto: any, filter?: (k: string) => boolean) {
  for (const k of Object.getOwnPropertyNames(baseProto)) {
    if (k === 'constructor' || k === '__proto__' || k === 'toJSON' || k === 'toString' || (filter && !filter(k))) {
      continue;
    }
    Object.defineProperty(targetProto, k, Object.getOwnPropertyDescriptor(baseProto, k) || Object.create(null));
  }
}

// noinspection JSUnusedLocalSymbols
export function inheritPropertyInitializers(
  target: Record<string, any>,
  clazz: Type,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isPropertyInherited = (key: string) => true,
) {
  try {
    const tempInstance = new clazz();
    const propertyNames = Object.getOwnPropertyNames(tempInstance);
    propertyNames
      .filter(
        propertyName =>
          typeof tempInstance[propertyName] !== 'undefined' && typeof target[propertyName] === 'undefined',
      )
      .filter(propertyName => isPropertyInherited(propertyName))
      .forEach(propertyName => {
        target[propertyName] = tempInstance[propertyName];
      });
  } catch {
    //
  }
}
