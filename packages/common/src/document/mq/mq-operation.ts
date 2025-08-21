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
  MQOperationDecorator,
  MQOperationDecoratorFactory,
} from '../decorators/mq-operation.decorator.js';
import type { MQController } from './mq-controller.js';
import type { MQHeader } from './mq-header';
import type { MQOperationResponse } from './mq-operation-response.js';

/**
 * @namespace MQOperation
 */
export namespace MQOperation {
  export interface Metadata
    extends Pick<OpraSchema.MQOperation, 'description' | 'channel'> {
    payloadType: TypeThunkAsync | string;
    keyType?: TypeThunkAsync | string;
    types?: ThunkAsync<Type | EnumType.EnumObject | EnumType.EnumArray>[];
    headers?: MQHeader.Metadata[];
    response?: MQOperationResponse.Metadata;
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
 * Type definition for MQOperation
 * @class MQOperation
 */
export interface MQOperationStatic {
  /**
   * Class constructor of MQOperation
   * @param controller
   * @param args
   */
  new (controller: MQController, args: MQOperation.InitArguments): MQOperation;

  /**
   * Property decorator
   * @param payloadType
   * @param options
   */ <T extends MQOperation.Options>(
    payloadType: ThunkAsync<Type> | string,
    options?: T,
  ): MQOperationDecorator;

  prototype: MQOperation;
}

/**
 * @class MQOperation
 */
export interface MQOperation extends MQOperationClass {}

/**
 *  MQOperation
 */
export const MQOperation = function (this: MQOperation, ...args: any[]) {
  // Decorator
  if (!this) {
    const [payloadType, options] = args as [
      type: ThunkAsync<Type> | string,
      options: MQOperation.Options,
    ];
    const decoratorChain: Function[] = [];
    return (MQOperation[DECORATOR] as MQOperationDecoratorFactory).call(
      undefined,
      decoratorChain,
      payloadType,
      options,
    );
  }

  // Constructor
  const [resource, initArgs] = args as [
    MQController,
    MQOperation.InitArguments,
  ];
  DocumentElement.call(this, resource);
  if (!CLASS_NAME_PATTERN.test(initArgs.name))
    throw new TypeError(`Invalid operation name (${initArgs.name})`);
  const _this = asMutable(this);
  _this.headers = [];
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
} as MQOperationStatic;

/**
 * @class MQOperation
 */
class MQOperationClass extends DocumentElement {
  declare readonly owner: MQController;
  declare readonly name: string;
  declare channel: string | RegExp | (string | RegExp)[];
  declare description?: string;
  declare payloadType: DataType;
  declare keyType?: DataType;
  declare types: DataTypeMap;
  declare headers: MQHeader[];
  declare response: MQOperationResponse;

  findHeader(paramName: string): MQHeader | undefined {
    const paramNameLower = paramName.toLowerCase();
    let prm: any;
    for (prm of this.headers) {
      if (typeof prm.name === 'string') {
        prm._nameLower = prm._nameLower || prm.name.toLowerCase();
        if (prm._nameLower === paramNameLower) return prm;
      }
      if (prm.name instanceof RegExp && prm.name.test(paramName)) return prm;
    }
  }

  toJSON(): OpraSchema.MQOperation {
    const out = omitUndefined<OpraSchema.MQOperation>({
      kind: OpraSchema.MQOperation.Kind,
      description: this.description,
      channel: this.channel,
      payloadType: this.payloadType.name
        ? this.payloadType.name
        : this.payloadType.toJSON(),
      keyType: this.keyType
        ? this.keyType.name
          ? this.keyType.name
          : this.keyType.toJSON()
        : undefined,
      response: this.response?.toJSON(),
    });
    if (this.headers.length) {
      out.headers = [];
      for (const prm of this.headers) {
        out.headers.push(prm.toJSON());
      }
    }
    return out;
  }
}

MQOperation.prototype = MQOperationClass.prototype;
MQOperation[DECORATOR] = MQOperationDecoratorFactory;
