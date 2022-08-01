import { DataType } from '../implementation/data-type/data-type';
import { Resource } from '../implementation/resource/resource';

export interface OpraService {
  readonly types: Record<string, DataType>;
  readonly resources: Record<string, Resource>;

  getDataTypes(): DataType[];

  getDataType(name: string): DataType;

  getDataType(name: string, silent: true): DataType | undefined;

  getResources(): Resource[];

  getResource(name: string): Resource;

  getResource(name: string, silent: true): Resource | undefined;
}
