import * as NestJS from '@nestjs/common';
import {Type} from '@nestjs/common';
import {
  PARAMTYPES_METADATA,
  PATH_METADATA, ROUTE_ARGS_METADATA,
  SELF_DECLARED_DEPS_METADATA
} from '@nestjs/common/constants';
import {RequestNode} from '../../common/request-node.js';
import {CONTROLLER_METADATA, ENTITY_METHOD_METADATA} from '../../constants.js';
import {OPRA_MODULE_OPTIONS} from '../../module/opra.constants.js';
import {OpraModuleOptions} from '../../module/opra.interface.js';
import {getClassName} from '../../utils/class-utils.js';
import {ControllerMetadata, ControllerMethodMetadata} from '../types.js';
import {Request as RequestDecorator} from './request.decorator.js';

const resourceNameRegEx = /[a-z]\w*/i;

export interface CollectionOptions {
  resourceName?: string;
}

export function Collection(type: NestJS.Type, resourceName?: string) {

  const options: CollectionOptions = {
    resourceName
  };

  const CollectionDecorator = function <TFunction extends Type<any>>(target: TFunction): TFunction | void {
    resourceName = options.resourceName || getClassName(type);
    if (!resourceName)
      throw new TypeError('Unable to resolve type name');
    if (!resourceNameRegEx.test(resourceName))
      throw new TypeError(`"${resourceName}" is not a valid resource name`);
    NestJS.Controller()(target);

    const controllerMeta: ControllerMetadata = {
      entity: type,
      resourceName
    }
    Reflect.defineMetadata(CONTROLLER_METADATA, controllerMeta, target);

    // Inject OpraModuleOptions into constructor
    const paramTypes = Reflect.getMetadata(PARAMTYPES_METADATA, target) || [];
    paramTypes.unshift(Object);
    Reflect.defineMetadata(PARAMTYPES_METADATA, paramTypes, target);

    const injectProperties: any[] = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, target) || [];
    injectProperties.forEach(x => x.index++);
    injectProperties.unshift({index: 0, param: OPRA_MODULE_OPTIONS});
    Reflect.defineMetadata(SELF_DECLARED_DEPS_METADATA, injectProperties, target);

    return wrapController(target, controllerMeta);
  }
  return CollectionDecorator;
}

/*
 * We need to manipulate path data of the controller. So we need OpraModuleOptions to get servicePrefix.
 * Because we can determine OpraModuleOptions instance, we need to inject it in the constructor method.
 * So we create a new controller class extended from original one. Then we add injection metadata.
 */

function wrapController<TFunction extends Type<any>>(
  target: TFunction,
  controllerMeta: ControllerMetadata
): TFunction {
  const NewClass = {
    [target.name]: class extends target {
      constructor(...args: any[]) {
        super(...args.slice(1));
        const opraOptions = args[0] as OpraModuleOptions;
        if (opraOptions.servicePrefix)
          Reflect.defineMetadata(PATH_METADATA, opraOptions.servicePrefix, NewClass);
      }
    }
  }[target.name];


  const propertyNames = Object.getOwnPropertyNames(target.prototype);
  for (const propertyName of propertyNames) {
    const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
    if (descriptor && typeof descriptor.value === 'function' && propertyName !== 'constructor') {
      const methodMetadata: ControllerMethodMetadata = Reflect.getMetadata(ENTITY_METHOD_METADATA, target.prototype, propertyName);
      if (methodMetadata) {
        // Override handler function
        const oldFunction = descriptor.value;
        descriptor.value = wrapMethodHandler(target.prototype,
          oldFunction, propertyName, controllerMeta, methodMetadata);
        Object.defineProperty(target.prototype, propertyName, descriptor);

        // Apply route decorators
        if (methodMetadata.method === 'list') {
          NestJS.Get(controllerMeta.resourceName)(target.prototype, propertyName, descriptor);
        } else if (methodMetadata.method === 'get') {
          NestJS.Get(controllerMeta.resourceName + '@*')(target.prototype, propertyName, descriptor);
        }
      }
    }
  }
  return NewClass;
}

function wrapMethodHandler(
  proto: Object,
  oldFunction: Function,
  propertyName: string,
  controllerMeta: ControllerMetadata,
  methodMetadata: ControllerMethodMetadata
) {
  const newMethod = {
    // eslint-disable-next-line object-shorthand
    [propertyName]: async function (...args: any[]) {
      const request: RequestNode = args[0];
      const result = await oldFunction.apply(this, args.slice(1));
      if (methodMetadata.method === 'get') {
        const url = request.url;
        const p = url.path.get(request.pathIndex + 1);
        if (p) {
          if (!Object.prototype.hasOwnProperty.call(result, p.resource)) {
            const subRequest = new RequestNode({
              ...request,
              resource: p.resource,
              resourceKey: p.key,
              pathIndex: request.pathIndex + 1,
              parent: request,
              thisValue: result
            });
            // todo determine and call sub handler to resolve value
            result[p.resource] = 'not implemented yet';
          }
        }
      }
      return result;
    }
  }[propertyName];

  // Copy nestjs metadata to new handler
  for (const k of Reflect.getMetadataKeys(oldFunction)) {
    Reflect.defineMetadata(k, Reflect.getMetadata(k, oldFunction), newMethod);
  }

  // Inject Request into handler function
  const argMetadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, proto.constructor, propertyName);
  if (argMetadata) {
    // Increase argument indexes by one
    Object.values(argMetadata).forEach((x: any) => x.index++);
  }
  // Inject Request at index 0
  RequestDecorator()(proto, propertyName, 0);

  return newMethod;
}
