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
import { WSController } from './ws-controller.js';

/**
 * @namespace WSOperation
 */
export namespace WSOperation {
  export interface Metadata
    extends Pick<OpraSchema.WSOperation, 'description' | 'channel'> {
    payloadType: TypeThunkAsync | string;
    keyType?: TypeThunkAsync | string;
    types?: ThunkAsync<Type | EnumType.EnumObject | EnumType.EnumArray>[];
  }

  export interface Options
    extends Partial<Pick<Metadata, 'description' | 'keyType'>> {
    channel?: (string | RegExp) | (string | RegExp)[];
  }

  export interface InitArguments
    extends Combine<
      {
        name: string;
        types?: DataType[];
        payloadType?: DataType | string | Type;
        keyType?: DataType | string | Type;
      },
      Pick<Metadata, 'description' | 'channel'>
    > {}
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
   * @param payloadType
   * @param options
   */ <T extends WSOperation.Options>(
    payloadType: ThunkAsync<Type> | string,
    options?: T,
  ): WSOperationDecorator;

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
  _this.channel = initArgs.channel;
  if (initArgs?.payloadType) {
    _this.payloadType =
      initArgs?.payloadType instanceof DataType
        ? initArgs.payloadType
        : _this.owner.node.getDataType(initArgs.payloadType);
  }
  if (initArgs?.keyType) {
    _this.keyType =
      initArgs?.keyType instanceof DataType
        ? initArgs.keyType
        : _this.owner.node.getDataType(initArgs.keyType);
  }
} as WSOperationStatic;

/**
 * @class WSOperation
 */
class WSOperationClass extends DocumentElement {
  declare readonly owner: WSController;
  declare readonly name: string;
  declare channel: string | RegExp | (string | RegExp)[];
  declare description?: string;
  declare payloadType: DataType;
  declare keyType?: DataType;
  declare types: DataTypeMap;

  toJSON(): OpraSchema.WSOperation {
    const out = omitUndefined<OpraSchema.WSOperation>({
      kind: OpraSchema.WSOperation.Kind,
      description: this.description,
      channel: this.channel,
      payloadType: this.payloadType.name
        ? this.payloadType.name
        : this.payloadType.toJSON(),
    });
    return out;
  }
}

WSOperation.prototype = WSOperationClass.prototype;
WSOperation[DECORATOR] = WSOperationDecoratorFactory;
