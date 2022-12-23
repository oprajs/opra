import { Type } from 'ts-gems';

export function applyMixins(derivedCtor: any, baseCtor: any, filter?: (k: string) => boolean) {
  for (const k of Object.getOwnPropertyNames(baseCtor.prototype)) {
    if ((k === 'constructor' || k === '__proto__' || k === 'toJSON' || k === 'toString') ||
        filter && !filter(k)
    ) continue;
    Object.defineProperty(
        derivedCtor.prototype,
        k,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, k) ||
        Object.create(null)
    );
  }
}

export function inheritPropertyInitializers(
    target: Record<string, any>,
    sourceClass: Type,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isPropertyInherited = (key: string) => true,
) {
  try {
    const tempInstance = new sourceClass();
    const propertyNames = Object.getOwnPropertyNames(tempInstance);
    propertyNames
        .filter(
            (propertyName) =>
                typeof tempInstance[propertyName] !== 'undefined' &&
                typeof target[propertyName] === 'undefined',
        )
        .filter((propertyName) => isPropertyInherited(propertyName))
        .forEach((propertyName) => {
          target[propertyName] = tempInstance[propertyName];
        });
  } catch {
    //
  }
}
