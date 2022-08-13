import * as Entity_ from './decorators/entity-resource.decorator.js';
import * as Handlers_ from './decorators/resourcee-handler.decorator.js';

export namespace Api {
  export type EntityResourceOptions = Entity_.EntityResourceOptions;
  export type SearchHandlerOptions = Handlers_.SearchOperationOptions;
  export type ReadHandlerOptions = Handlers_.ReadOperationOptions;
  export type UpdateOperationOptions = Handlers_.UpdateOperationOptions;
  export type PatchOperationOptions = Handlers_.PatchOperationOptions;
  export type DeleteOperationOptions = Handlers_.DeleteOperationOptions;
  export type ExecuteOperationOptions = Handlers_.ExecuteOperationOptions;

  export const EntityResource: typeof Entity_.EntityResource = Entity_.EntityResource;
  export const SearchOperation: typeof Handlers_.SearchOperation = Handlers_.SearchOperation;
  export const ReadOperation: typeof Handlers_.ReadOperation = Handlers_.ReadOperation;
  export const UpdateOperation: typeof Handlers_.UpdateOperation = Handlers_.UpdateOperation;
  export const PatchOperation: typeof Handlers_.PatchOperation = Handlers_.PatchOperation;
  export const DeleteOperation: typeof Handlers_.DeleteOperation = Handlers_.DeleteOperation;
  export const ExecuteOperation: typeof Handlers_.ExecuteOperation = Handlers_.ExecuteOperation;

}
