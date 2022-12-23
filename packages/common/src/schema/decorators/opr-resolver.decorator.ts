import { RESOLVER_METADATA } from '../constants.js';
import {
  ICreateResolverMetadata,
  IDeleteManyResolverMetadata,
  IDeleteResolverMetadata,
  IGetResolverMetadata,
  ISearchResolverMetadata,
  IUpdateManyResolverMetadata,
  IUpdateResolverMetadata
} from '../interfaces/resource.metadata.js';

export function OprCreateResolver(options?: ICreateResolverMetadata) {
  return (target: Object, propertyKey: 'create'): void => {
    if (propertyKey !== 'create')
      throw new TypeError('This decorator can only be applied for the "create" property');
    const metadata: ICreateResolverMetadata = {
      ...options
    }
    Reflect.defineMetadata(RESOLVER_METADATA, metadata, target, propertyKey);
  };
}

export function OprDeleteResolver(options?: IDeleteResolverMetadata) {
  return (target: Object, propertyKey: 'delete'): void => {
    if (propertyKey !== 'delete')
      throw new TypeError('This decorator can only be applied for the "delete" property');
    const metadata: IDeleteResolverMetadata = {
      ...options
    }
    Reflect.defineMetadata(RESOLVER_METADATA, metadata, target, propertyKey);
  };
}

export function OprDeleteManyResolver(options?: IDeleteManyResolverMetadata) {
  return (target: Object, propertyKey: 'deleteMany'): void => {
    if (propertyKey !== 'deleteMany')
      throw new TypeError('This decorator can only be applied for the "deleteMany" property');
    const metadata: IDeleteManyResolverMetadata = {
      ...options
    }
    Reflect.defineMetadata(RESOLVER_METADATA, metadata, target, propertyKey);
  };
}


export function OprUpdateResolver(options?: IUpdateResolverMetadata) {
  return (target: Object, propertyKey: 'update'): void => {
    if (propertyKey !== 'update')
      throw new TypeError('This decorator can only be applied for the "update" property');
    const metadata: IUpdateResolverMetadata = {
      ...options
    }
    Reflect.defineMetadata(RESOLVER_METADATA, metadata, target, propertyKey);
  };
}

export function OprUpdateManyResolver(options?: IUpdateManyResolverMetadata) {
  return (target: Object, propertyKey: 'updateMany'): void => {
    if (propertyKey !== 'updateMany')
      throw new TypeError('This decorator can only be applied for the "updateMany" property');
    const metadata: IUpdateManyResolverMetadata = {
      ...options
    }
    Reflect.defineMetadata(RESOLVER_METADATA, metadata, target, propertyKey);
  };
}

export function OprGetResolver(options?: IGetResolverMetadata) {
  return (target: Object, propertyKey: 'get'): void => {
    if (propertyKey !== 'get')
      throw new TypeError('This decorator can only be applied for the "get" property');
    const metadata: IGetResolverMetadata = {
      ...options
    }
    Reflect.defineMetadata(RESOLVER_METADATA, metadata, target, propertyKey);
  };
}

export function OprSearchResolver(options?: ISearchResolverMetadata) {
  return (target: Object, propertyKey: 'search'): void => {
    if (propertyKey !== 'search')
      throw new TypeError('This decorator can only be applied for the "search" property');
    const metadata: ICreateResolverMetadata = {
      ...options
    }
    Reflect.defineMetadata(RESOLVER_METADATA, metadata, target, propertyKey);
  };
}
