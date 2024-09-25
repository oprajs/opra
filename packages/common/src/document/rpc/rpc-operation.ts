import type { Combine, ThunkAsync, Type } from 'ts-gems';
import { asMutable } from 'ts-gems';
import { TypeThunkAsync } from 'ts-gems/lib/types';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DataTypeMap } from '../common/data-type-map.js';
import { DocumentElement } from '../common/document-element.js';
import { CLASS_NAME_PATTERN, DECORATOR, kDataTypeMap } from '../constants.js';
import { DataType } from '../data-type/data-type.js';
import type { EnumType } from '../data-type/enum-type.js';
import { RpcOperationDecorator, RpcOperationDecoratorFactory } from '../decorators/rpc-operation.decorator.js';
import type { RpcController } from './rpc-controller';
import type { RpcHeader } from './rpc-header';
import type { RpcOperationResponse } from './rpc-operation-response';

/**
 * @namespace RpcOperation
 */
export namespace RpcOperation {
  export interface Metadata extends Pick<OpraSchema.RpcOperation, 'description' | 'channel'> {
    payloadType: TypeThunkAsync | string;
    keyType?: TypeThunkAsync | string;
    types?: ThunkAsync<Type | EnumType.EnumObject | EnumType.EnumArray>[];
    headers?: RpcHeader.Metadata[];
    response?: RpcOperationResponse.Metadata;
  }

  export interface Options extends Partial<Pick<Metadata, 'description' | 'keyType'>> {
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
 * Type definition for RpcOperation
 * @class RpcOperation
 */
export interface RpcOperationStatic {
  /**
   * Class constructor of RpcOperation
   * @param controller
   * @param args
   */
  new (controller: RpcController, args: RpcOperation.InitArguments): RpcOperation;

  /**
   * Property decorator
   * @param payloadType
   * @param options
   */ <T extends RpcOperation.Options>(payloadType: ThunkAsync<Type> | string, options?: T): RpcOperationDecorator;

  prototype: RpcOperation;
}

/**
 * @class RpcOperation
 */
export interface RpcOperation extends RpcOperationClass {}

/**
 *  RpcOperation
 */
export const RpcOperation = function (this: RpcOperation, ...args: any[]) {
  // Decorator
  if (!this) {
    const [payloadType, options] = args as [type: ThunkAsync<Type> | string, options: RpcOperation.Options];
    const decoratorChain: Function[] = [];
    return (RpcOperation[DECORATOR] as RpcOperationDecoratorFactory).call(
      undefined,
      decoratorChain,
      payloadType,
      options,
    );
  }

  // Constructor
  const [resource, initArgs] = args as [RpcController, RpcOperation.InitArguments];
  DocumentElement.call(this, resource);
  if (!CLASS_NAME_PATTERN.test(initArgs.name)) throw new TypeError(`Invalid operation name (${initArgs.name})`);
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
      initArgs?.keyType instanceof DataType ? initArgs.keyType : _this.owner.node.getDataType(initArgs.keyType);
  }
} as RpcOperationStatic;

/**
 * @class RpcOperation
 */
class RpcOperationClass extends DocumentElement {
  declare readonly owner: RpcController;
  declare readonly name: string;
  declare channel: string | RegExp | (string | RegExp)[];
  declare description?: string;
  declare payloadType: DataType;
  declare keyType?: DataType;
  declare types: DataTypeMap;
  declare headers: RpcHeader[];
  declare response: RpcOperationResponse;

  findHeader(paramName: string): RpcHeader | undefined {
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

  toJSON(): OpraSchema.RpcOperation {
    const out = omitUndefined<OpraSchema.RpcOperation>({
      kind: OpraSchema.RpcOperation.Kind,
      description: this.description,
      channel: this.channel,
      payloadType: this.payloadType.name ? this.payloadType.name : this.payloadType.toJSON(),
      keyType: this.keyType ? (this.keyType.name ? this.keyType.name : this.keyType.toJSON()) : undefined,
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

RpcOperation.prototype = RpcOperationClass.prototype;
RpcOperation[DECORATOR] = RpcOperationDecoratorFactory;
