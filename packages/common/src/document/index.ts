import 'reflect-metadata';
import './decorators/http-operation-entity.decorator.js';
import './decorators/http-operation-entity-create.decorator.js';
import './decorators/http-operation-entity-delete.decorator.js';
import './decorators/http-operation-entity-delete-many.decorator.js';
import './decorators/http-operation-entity-find-many.decorator.js';
import './decorators/http-operation-entity-get.decorator.js';
import './decorators/http-operation-entity-replace.decorator.js';
import './decorators/http-operation-entity-update.decorator.js';
import './decorators/http-operation-entity-update-many.decorator.js';
import * as RpcControllerDecorator_ from './decorators/rpc-controller.decorator.js';
import * as RpcOperationDecorator_ from './decorators/rpc-operation.decorator.js';
import * as DataTypeFactory_ from './factory/data-type.factory.js';
import * as HttpApiFactory_ from './factory/http-api.factory.js';

export * from './api-document.js';
export * from './common/api-base.js';
export * from './common/data-type-map.js';
export * from './common/document-element.js';
export * from './common/document-init-context.js';
export * from './common/document-node.js';
export * from './common/opra-document-error.js';
export * from './constants.js';
export * from './data-type/api-field.js';
export * from './data-type/complex-type.js';
export * from './data-type/data-type.js';
export * from './data-type/enum-type.js';
export * from './data-type/extended-types/index.js';
export * from './data-type/mapped-type.js';
export * from './data-type/mixin-type.js';
export * from './data-type/omit-type.js';
export * from './data-type/partial-type.js';
export * from './data-type/pick-type.js';
export * from './data-type/primitive-types/index.js';
export * from './data-type/required-type.js';
export * from './data-type/simple-type.js';
export * from './data-type/union-type.js';
export type { RpcControllerDecorator } from './decorators/rpc-controller.decorator.js';
export type { RpcOperationDecorator } from './decorators/rpc-operation.decorator.js';
export * from './factory/api-document.factory.js';
export * from './http/http-api.js';
export * from './http/http-controller.js';
export * from './http/http-media-type.js';
export * from './http/http-multipart-field.js';
export * from './http/http-operation.js';
export * from './http/http-operation-response.js';
export * from './http/http-parameter.js';
export * from './http/http-request-body.js';
export * from './http/http-status-range.js';
export * from './rpc/rpc-api.js';
export * from './rpc/rpc-controller.js';
export * from './rpc/rpc-header.js';
export * from './rpc/rpc-operation.js';
export type { RpcOperationResponse } from './rpc/rpc-operation-response';

export namespace classes {
  export import HttpApiFactory = HttpApiFactory_.HttpApiFactory;
  export import DataTypeFactory = DataTypeFactory_.DataTypeFactory;
  export import RpcOperationDecoratorFactory = RpcOperationDecorator_.RpcOperationDecoratorFactory;
  export import RpcControllerDecoratorFactory = RpcControllerDecorator_.RpcControllerDecoratorFactory;
}
