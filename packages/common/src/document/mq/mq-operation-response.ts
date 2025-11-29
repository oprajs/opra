import { omitUndefined } from '@jsopen/objects';
import type { Combine, Type } from 'ts-gems';
import { TypeThunkAsync } from 'ts-gems/lib/types';
import { OpraSchema } from '../../schema/index.js';
import { DocumentElement } from '../common/document-element.js';
import { DataType } from '../data-type/data-type.js';
import type { MQHeader } from './mq-header';
import type { MQOperation } from './mq-operation.js';

/**
 * @namespace MQOperationResponse
 */
export namespace MQOperationResponse {
  export interface Metadata extends Combine<
    {
      payloadType?: TypeThunkAsync | string;
      keyType?: TypeThunkAsync | string;
      headers?: MQHeader.Metadata[];
    },
    OpraSchema.MQOperationResponse
  > {}

  export interface Options extends Combine<
    {
      keyType?: Type | string;
    },
    Pick<Metadata, 'channel' | 'description'>
  > {}

  export interface InitArguments extends Combine<
    {
      payloadType?: DataType | string | Type;
      keyType?: DataType | string | Type;
    },
    Pick<Metadata, 'channel' | 'description'>
  > {}
}

/**
 * @class MQOperationResponse
 */
export class MQOperationResponse extends DocumentElement {
  declare readonly owner: MQOperation;
  channel?: string | RegExp | (string | RegExp)[];
  description?: string;
  payloadType: DataType;
  keyType?: DataType;
  headers: MQHeader[] = [];

  constructor(
    owner: MQOperation,
    initArgs?: MQOperationResponse.InitArguments,
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

  toJSON(): OpraSchema.MQOperationResponse {
    const out = omitUndefined<OpraSchema.MQOperationResponse>({
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
