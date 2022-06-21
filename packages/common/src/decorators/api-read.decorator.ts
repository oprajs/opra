import "reflect-metadata";
import _ from 'lodash';
import {StrictOmit} from 'ts-gems';
import {RESOURCE_OPERATIONS} from '../constants';
import {OpraReadOperationMetadata} from '../interfaces';

export function ApiRead(args?: StrictOmit<OpraReadOperationMetadata, 'resolver'>) {

  return function (target: Object,
                   propertyKey: string | symbol,
                   descriptor?: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> | void {
    descriptor = descriptor || Object.getOwnPropertyDescriptor(target, propertyKey);
    if (!descriptor)
      throw new TypeError(`No property descriptor found for "${String(propertyKey)}"`);
    /* istanbul ignore next */
    if (typeof propertyKey !== 'string')
      throw new TypeError('Symbol properties can not be used as api method');

    const operations: any = Reflect.getMetadata(RESOURCE_OPERATIONS, target) || {};

    const meta: OpraReadOperationMetadata = {
      resolver: descriptor.value,
      methodName: propertyKey
    }
    Object.assign(meta, _.omit(args, Object.keys(meta)));
    operations.read = meta;
    Reflect.defineMetadata(RESOURCE_OPERATIONS, operations, target);
  }
}
