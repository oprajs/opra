import { RESOLVER_METADATA } from '../constants.js';
import { ApiResolverMetadata } from '../interfaces/metadata/api-resolver.metadata.js';

export function OprResolver(options?: ApiResolverMetadata): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    const metadata: ApiResolverMetadata = {
      ...options
    }
    Reflect.defineMetadata(RESOLVER_METADATA, metadata, target, propertyKey);
  };
}
