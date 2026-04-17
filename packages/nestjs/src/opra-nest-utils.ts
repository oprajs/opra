import type { Type } from '@nestjs/common';

const GUARDS_METADATA = '__guards__';
const INTERCEPTORS_METADATA = '__interceptors__';
const EXCEPTION_FILTERS_METADATA = '__exceptionFilters__';

/**
 * Utility class for Opra-NestJS integration.
 */
export class OpraNestUtils {
  /**
   * Copies Opra-related decorator metadata from source classes to a target class.
   * Also merges NestJS guards, interceptors, and exception filters.
   *
   * @param target - The target class to receive the metadata.
   * @param source - The source classes to copy metadata from.
   */
  static copyDecoratorMetadata(target: Type, ...source: Type[]) {
    for (const parent of source) {
      const metadataKeys = Reflect.getOwnMetadataKeys(parent);
      for (const key of metadataKeys) {
        if (
          typeof key === 'string' &&
          key.startsWith('opra.') &&
          !Reflect.hasOwnMetadata(key, target)
        ) {
          const metadata = Reflect.getMetadata(key, parent);
          Reflect.defineMetadata(key, metadata, target);
          continue;
        }
        if (
          key === GUARDS_METADATA ||
          key === INTERCEPTORS_METADATA ||
          key === EXCEPTION_FILTERS_METADATA
        ) {
          const m1 = Reflect.getMetadata(key, target) || [];
          const metadata = [...m1];
          const m2 = Reflect.getOwnMetadata(key, parent) || [];
          m2.forEach((t: any) => {
            if (!metadata.includes(t)) {
              metadata.push(t);
            }
          });
          Reflect.defineMetadata(key, metadata, target);
        }
      }
    }
  }
}
