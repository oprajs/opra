import {Type} from '@nestjs/common';

export interface ControllerMetadata {
  entity: Type;
  resourceName: string;
}

export interface ControllerMethodMetadata {
  method: 'list' | 'get' | 'create' | 'update' | 'path' | 'delete';
  name: string;
}
