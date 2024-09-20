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
import { MsgOperationDecorator, MsgOperationDecoratorFactory } from '../decorators/msg-operation.decorator.js';
import type { MsgController } from './msg-controller.js';
import type { MsgHeader } from './msg-header.js';
import type { MsgOperationResponse } from './msg-operation-response.js';

/**
 * @namespace MsgOperation
 */
export namespace MsgOperation {
  export interface Metadata extends Pick<OpraSchema.MsgOperation, 'description' | 'channel'> {
    payloadType: TypeThunkAsync | string;
    keyType?: TypeThunkAsync | string;
    types?: ThunkAsync<Type | EnumType.EnumObject | EnumType.EnumArray>[];
    headers?: MsgHeader.Metadata[];
    response?: MsgOperationResponse.Metadata;
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
 * Type definition for MsgOperation
 * @class MsgOperation
 */
export interface MsgOperationStatic {
  /**
   * Class constructor of MsgOperation
   * @param controller
   * @param args
   */
  new (controller: MsgController, args: MsgOperation.InitArguments): MsgOperation;

  /**
   * Property decorator
   * @param payloadType
   * @param options
   */ <T extends MsgOperation.Options>(payloadType: ThunkAsync<Type> | string, options?: T): MsgOperationDecorator;

  prototype: MsgOperation;
}

/**
 * @class MsgOperation
 */
export interface MsgOperation extends MsgOperationClass {}

/**
 *  MsgOperation
 */
export const MsgOperation = function (this: MsgOperation, ...args: any[]) {
  // Decorator
  if (!this) {
    const [payloadType, options] = args as [type: ThunkAsync<Type> | string, options: MsgOperation.Options];
    const decoratorChain: Function[] = [];
    return (MsgOperation[DECORATOR] as MsgOperationDecoratorFactory).call(
      undefined,
      decoratorChain,
      payloadType,
      options,
    );
  }

  // Constructor
  const [resource, initArgs] = args as [MsgController, MsgOperation.InitArguments];
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
} as MsgOperationStatic;

/**
 * @class MsgOperation
 */
class MsgOperationClass extends DocumentElement {
  declare readonly owner: MsgController;
  declare readonly name: string;
  declare channel: string | RegExp | (string | RegExp)[];
  declare description?: string;
  declare payloadType: DataType;
  declare keyType?: DataType;
  declare types: DataTypeMap;
  declare headers: MsgHeader[];
  declare response: MsgOperationResponse;

  findHeader(paramName: string): MsgHeader | undefined {
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

  toJSON(): OpraSchema.MsgOperation {
    const out = omitUndefined<OpraSchema.MsgOperation>({
      kind: OpraSchema.MsgOperation.Kind,
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

MsgOperation.prototype = MsgOperationClass.prototype;
MsgOperation[DECORATOR] = MsgOperationDecoratorFactory;
