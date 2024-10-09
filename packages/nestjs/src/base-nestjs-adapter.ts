import { ModuleRef } from '@nestjs/core';
// import { Injector } from '@nestjs/core/injector/injector';
// import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
// import { Module } from '@nestjs/core/injector/module';
// import { REQUEST_CONTEXT_ID } from '@nestjs/core/router/request/request-constants';
// import { BaseRpcContext, PatternMetadata } from '@nestjs/microservices';
// import { RequestContextHost } from '@nestjs/microservices/context/request-context-host';

export abstract class BaseNestAdapter {
  protected constructor(protected readonly moduleRef: ModuleRef) {}

  // public createRequestScopedHandler(
  //   wrapper: InstanceWrapper,
  //   instance: any,
  //   pattern: PatternMetadata,
  //   moduleRef: Module,
  //   moduleKey: string,
  //   methodKey: string,
  //   // defaultCallMetadata: Record<string, any> = DEFAULT_CALLBACK_METADATA,
  //   isEventHandler = false,
  // ) {
  //   const collection = moduleRef.controllers;
  //   // const { instance } = wrapper;
  //
  //   const isTreeDurable = wrapper.isDependencyTreeDurable();
  //
  //   const requestScopedHandler = async (...args: unknown[]) => {
  //     try {
  //       let contextId: ContextId;
  //
  //       let [dataOrContextHost] = args;
  //       if (dataOrContextHost instanceof RequestContextHost) {
  //         contextId = this.getContextId(dataOrContextHost, isTreeDurable);
  //         args.shift();
  //       } else {
  //         const [data, reqCtx] = args;
  //         const request = RequestContextHost.create(pattern, data, reqCtx as BaseRpcContext);
  //         contextId = this.getContextId(request, isTreeDurable);
  //         dataOrContextHost = request;
  //       }
  //
  //       const contextInstance = await this.injector.loadPerContext(instance, moduleRef, collection, contextId);
  //       const proxy = this.contextCreator.create(
  //         contextInstance,
  //         contextInstance[methodKey],
  //         moduleKey,
  //         methodKey,
  //         contextId,
  //         wrapper.id,
  //         defaultCallMetadata,
  //       );
  //
  //       const returnValue = proxy(...args);
  //       if (isEventHandler) {
  //         return this.forkJoinHandlersIfAttached(returnValue, [dataOrContextHost, ...args], requestScopedHandler);
  //       }
  //       return returnValue;
  //     } catch (err) {
  //       let exceptionFilter = this.exceptionFiltersCache.get(instance[methodKey]);
  //       if (!exceptionFilter) {
  //         exceptionFilter = this.exceptionFiltersContext.create(instance, instance[methodKey], moduleKey);
  //         this.exceptionFiltersCache.set(instance[methodKey], exceptionFilter);
  //       }
  //       const host = new ExecutionContextHost(args);
  //       host.setType('rpc');
  //       return exceptionFilter.handle(err, host);
  //     }
  //   };
  //   return requestScopedHandler;
  // }
  //
  // private getContextId<T extends Record<any, any> = any>(request: T, isTreeDurable: boolean): ContextId {
  //   const contextId = ContextIdFactory.getByRequest(request);
  //   if (!request[REQUEST_CONTEXT_ID as any]) {
  //     Object.defineProperty(request, REQUEST_CONTEXT_ID, {
  //       value: contextId,
  //       enumerable: false,
  //       writable: false,
  //       configurable: false,
  //     });
  //
  //     const requestProviderValue = isTreeDurable ? contextId.payload : request;
  //     this.container.registerRequestProvider(requestProviderValue, contextId);
  //   }
  //   return contextId;
  // }
}
