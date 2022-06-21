import {Type} from 'ts-gems';
import {OpraSchemaProperty} from './schema-property-definition.interface';

export type OpraSchema = {
  ctor: Type;
  name: string;
  description?: string;
  properties: Record<string, OpraSchemaProperty>;
}
