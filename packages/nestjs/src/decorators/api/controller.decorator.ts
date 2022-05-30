import * as NestJS from '@nestjs/common';
import {Type} from '@nestjs/common';
import {
  PATH_METADATA,
  SELF_DECLARED_DEPS_METADATA
} from '@nestjs/common/constants';
import {ENTITY_METHOD_METADATA} from '../../constants';
import {OPRA_MODULE_OPTIONS} from '../../module/opra.constants';
import {OpraModuleOptions} from '../../module/opra.interface';
import {getClassName} from '../../utils/class-utils';

export interface ControllerOptions {
  name?: string;
}

export function Controller(type: NestJS.Type, name?: string) {

  const options: ControllerOptions = {
    name
  };

  const ControllerDecorator = function <TFunction extends Type<any>>(target: TFunction): TFunction | void {
    const _name = options.name || getClassName(type);
    if (!_name)
      throw new TypeError('Unable to resolve type name');
    NestJS.Controller()(target);

    const propertyNames = Object.getOwnPropertyNames(target.prototype);
    for (const property of propertyNames) {
      if (property !== 'constructor' && typeof target.prototype[property] === 'function') {
        const meta = Reflect.getMetadata(ENTITY_METHOD_METADATA, target.prototype, property);
        if (meta) {
          const descriptor = Object.getOwnPropertyDescriptor(target.prototype, property) as PropertyDescriptor;
          if (meta.method === 'list') {
            NestJS.Get(_name)(target.prototype, property, descriptor);
          }
        }
      }
    }

    /* We need to manipulate path data of the controller. So we need OpraModuleOptions to get servicePrefix.
    * Because we can determine OpraModuleOptions instance, we need to inject it in the constructor method.
    * So we create a new controller class extended from original one. Then we add injection metadata.
    */
    const NewClass = {
      [target.name]: class extends target {
        constructor(...args: any[]) {
          super(...args.slice(1));
          const opraOptions = args[0] as OpraModuleOptions;
          if (opraOptions.servicePrefix)
            Reflect.defineMetadata(PATH_METADATA, opraOptions.servicePrefix, target);
        }
      }
    }[target.name];

    const paramTypes = Reflect.getMetadata('design:paramtypes', target);
    if (paramTypes) {
      paramTypes.unshift(Object);
      Reflect.defineMetadata('design:paramtypes', paramTypes, target);
    }

    const injectProperties: any[] = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, target) || [];
    injectProperties.forEach(x => x.index++);
    injectProperties.unshift({index: 0, param: OPRA_MODULE_OPTIONS});
    Reflect.defineMetadata(SELF_DECLARED_DEPS_METADATA, injectProperties, target);

    return NewClass;
  }
  return ControllerDecorator;
}
