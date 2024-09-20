import type { MsgOperationResponse } from '@opra/common';
import { ConsumerConfig } from 'kafkajs';

export type RequestParseFunction = (buffer: Buffer) => any;

export interface KafkaOperationOptions extends ConsumerConfig {
  fromBeginning?: boolean;
}

export interface KafkaOperationResponseOptions extends MsgOperationResponse.Options {}
