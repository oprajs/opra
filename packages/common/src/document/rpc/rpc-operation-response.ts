import { omitUndefined } from '@jsopen/objects';
import type { Combine, Type } from 'ts-gems';
import { TypeThunkAsync } from 'ts-gems/lib/types';
import { OpraSchema } from '../../schema/index.js';
import { DocumentElement } from '../common/document-element.js';
import { DataType } from '../data-type/data-type.js';
import type { RpcHeader } from './rpc-header';
import type { RpcOperation } from './rpc-operation';

/**
 * @namespace RpcOperationResponse
 */
export namespace RpcOperationResponse {
  export interface Metadata
    extends Combine<
      {
        payloadType?: TypeThunkAsync | string;
        keyType?: TypeThunkAsync | string;
        headers?: RpcHeader.Metadata[];
      },
      OpraSchema.RpcOperationResponse
    > {}

  export interface Options
    extends Combine<
      {
        keyType?: Type | string;
      },
      Pick<Metadata, 'channel' | 'description'>
    > {}

  export interface InitArguments
    extends Combine<
      {
        payloadType?: DataType | string | Type;
        keyType?: DataType | string | Type;
      },
      Pick<Metadata, 'channel' | 'description'>
    > {}
}

/**
 * @class RpcOperationResponse
 */
export class RpcOperationResponse extends DocumentElement {
  declare readonly owner: RpcOperation;
  channel?: string | RegExp | (string | RegExp)[];
  description?: string;
  payloadType: DataType;
  keyType?: DataType;
  headers: RpcHeader[] = [];

  constructor(
    owner: RpcOperation,
    initArgs?: RpcOperationResponse.InitArguments,
  ) {
    super(owner);
    this.channel = initArgs?.channel;
    this.description = initArgs?.description;
    if (initArgs?.payloadType) {
      this.payloadType =
        initArgs?.payloadType instanceof DataType
          ? initArgs.payloadType
          : this.owner.node.getDataType(initArgs.payloadType);
    } else this.payloadType = this.owner.node.getDataType('any');
    if (initArgs?.keyType) {
      this.keyType =
        initArgs?.keyType instanceof DataType
          ? initArgs.keyType
          : this.owner.node.getDataType(initArgs.keyType);
    }
  }

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

  toJSON(): OpraSchema.RpcOperationResponse {
    const out = omitUndefined<OpraSchema.RpcOperationResponse>({
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
