import { omitUndefined } from '@jsopen/objects';
import type { Combine, ThunkAsync, Type } from 'ts-gems';
import { asMutable } from 'ts-gems';
import { TypeThunkAsync } from 'ts-gems/lib/types';
import { OpraSchema } from '../../schema/index.js';
import { DataTypeMap } from '../common/data-type-map.js';
import { DocumentElement } from '../common/document-element.js';
import { CLASS_NAME_PATTERN, DECORATOR, kDataTypeMap } from '../constants.js';
import { DataType } from '../data-type/data-type.js';
import type { EnumType } from '../data-type/enum-type.js';
import {
  WSOperationDecorator,
  WSOperationDecoratorFactory,
} from '../decorators/ws-operation.decorator.js';
import { parseRegExp } from '../utils/parse-regexp.util.js';
import { WSController } from './ws-controller.js';

/**
 * @namespace WSOperation
 */
export namespace WSOperation {
  export interface Metadata
    extends Pick<OpraSchema.WSOperation, 'description' | 'event'> {
    arguments?: (TypeThunkAsync | string)[];
    types?: ThunkAsync<Type | EnumType.EnumObject | EnumType.EnumArray>[];
  }

  export interface Options extends Partial<Pick<Metadata, 'description'>> {
    event?: string | RegExp;
  }

  export interface InitArguments
    extends Combine<
      {
        name: string;
        types?: DataType[];
        arguments?: (DataType | string | Type)[];
      },
      Pick<Metadata, 'description'>
    > {
    event?: string | RegExp;
  }
}

/**
 * Type definition for WSOperation
 * @class WSOperation
 */
export interface WSOperationStatic {
  /**
   * Class constructor of WSOperation
   * @param controller
   * @param args
   */
  new (controller: WSController, args: WSOperation.InitArguments): WSOperation;

  /**
   * Property decorator
   * @param options
   */ <T extends WSOperation.Options>(options?: T): WSOperationDecorator;

  prototype: WSOperation;
}

/**
 * @class WSOperation
 */
export interface WSOperation extends WSOperationClass {}

/**
 *  WSOperation
 */
export const WSOperation = function (this: WSOperation, ...args: any[]) {
  // Decorator
  if (!this) {
    const [payloadType, options] = args as [
      type: ThunkAsync<Type> | string,
      options: WSOperation.Options,
    ];
    const decoratorChain: Function[] = [];
    return (WSOperation[DECORATOR] as WSOperationDecoratorFactory).call(
      undefined,
      decoratorChain,
      payloadType,
      options,
    );
  }

  // Constructor
  const [resource, initArgs] = args as [
    WSController,
    WSOperation.InitArguments,
  ];
  DocumentElement.call(this, resource);
  if (!CLASS_NAME_PATTERN.test(initArgs.name))
    throw new TypeError(`Invalid operation name (${initArgs.name})`);
  const _this = asMutable(this);
  _this.types = _this.node[kDataTypeMap] = new DataTypeMap();
  _this.name = initArgs.name;
  _this.description = initArgs.description;
  if (initArgs.event)
    this.event =
      initArgs.event instanceof RegExp
        ? initArgs.event
        : initArgs.event.startsWith('/')
          ? parseRegExp(initArgs.event)
          : initArgs.event;
  else _this.event = this.name;
  if (initArgs?.arguments) {
    _this.arguments = initArgs.arguments.map(arg =>
      arg instanceof DataType ? arg : _this.owner.node.getDataType(arg),
    );
  }
} as WSOperationStatic;

/**
 * @class WSOperation
 */
class WSOperationClass extends DocumentElement {
  declare readonly owner: WSController;
  declare readonly name: string;
  declare description?: string;
  declare event: string | RegExp;
  declare arguments?: DataType[];
  declare types: DataTypeMap;

  toJSON(): OpraSchema.WSOperation {
    return omitUndefined<OpraSchema.WSOperation>({
      kind: OpraSchema.WSOperation.Kind,
      description: this.description,
      event: this.event,
      arguments: this.arguments?.map(arg =>
        arg.name ? arg.name : arg.toJSON(),
      ),
    });
  }
}

WSOperation.prototype = WSOperationClass.prototype;
WSOperation[DECORATOR] = WSOperationDecoratorFactory;
