import head from 'lodash.head';
import { ContextType, Inject, Injectable } from '@nestjs/common';
import { ContextIdFactory, createContextId, ModulesContainer, REQUEST } from '@nestjs/core';
import { ExternalContextCreator, ExternalContextOptions } from '@nestjs/core/helpers/external-context-creator';
import { ParamMetadata } from '@nestjs/core/helpers/interfaces/params-metadata.interface';
import { Injector } from '@nestjs/core/injector/injector';
import { ContextId, InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { InternalCoreModule } from '@nestjs/core/injector/internal-core-module';
import { Module } from '@nestjs/core/injector/module.js';
import { REQUEST_CONTEXT_ID } from '@nestjs/core/router/request/request-constants';
import { ApiDocument, ApiDocumentFactory, OpraSchema, HTTP_CONTROLLER_METADATA } from '@opra/common';
import * as opraCore from '@opra/core';
import { PARAM_ARGS_METADATA } from '../constants.js';
import { HandlerParamType } from '../enums/handler-paramtype.enum.js';
import { NestExplorer } from '../services/nest-explorer.js';
import { getNumberOfArguments } from '../utils/function.utils.js';
import { OpraParamsFactory } from './params.factory.js';

const noOpFunction = () => void 0;

@Injectable()
export class OpraApiFactory {
  private readonly paramsFactory = new OpraParamsFactory();
  private readonly injector = new Injector();
  @Inject()
  private readonly modulesContainer: ModulesContainer;
  @Inject()
  private readonly externalContextCreator: ExternalContextCreator;
  @Inject()
  private readonly explorerService: NestExplorer;

  async generateService(
      rootModule: Module,
      contextType: ContextType,
      apiSchema?: Partial<ApiDocumentFactory.InitArguments>,
  ): Promise<ApiDocument> {
    const info = {...apiSchema?.info} as OpraSchema.DocumentInfo;
    info.title = info.title || 'Untitled service';
    info.version = info.version || '1';
    const root: ApiDocumentFactory.RootInit = {
      resources: []
    };
    const apiInit: ApiDocumentFactory.InitArguments = {
      version: OpraSchema.SpecVersion,
      ...apiSchema,
      info,
      types: apiSchema?.types || [],
      root
    }

    /*
     * Walk through modules and add Resource instances to the api schema
     */
    this.explorerService.exploreResources(rootModule, (wrapper, modulePath) => {
      const instance = wrapper.instance;
      const ctor = instance.constructor;
      const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, ctor);
      let node: any = root;
      modulePath.forEach(m => {
        const mt = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, (m as any)._metatype);
        if (mt) {
          let n = node.resources.find(x => x.controller === m.instance);
          if (!n) {
            n = {
              ...mt,
              kind: 'Container',
              resources: [...(mt.resources || [])],
              controller: m.instance
            }
            node.resources.push(n);
          }
          node = n;
        }
      });
      // Do not add Modules decorated with @Container
      if (wrapper.metatype !== wrapper.host?.metatype)
        (node.resources as any[]).push(instance);
      /* Wrap operation and action functions */
      const isRequestScoped = !wrapper.isDependencyTreeStatic();
      const methodNames = [...Object.keys(metadata.operations || []), ...Object.keys(metadata.actions || [])];
      for (const methodName of methodNames) {
        const endpointFunction = instance[methodName];
        const nestHandlerName = methodName + '_nestjs';
        // Skip patch if controller do not have function for endpoint or already patched before
        if (typeof endpointFunction !== 'function')
          continue;

        // NestJs requires calling handler function in different order than Opra.
        // In NestJS, handler functions must be called with these parameters (req, res, next)
        // In Opra, handler functions must be called with these parameters (context)
        // To work handlers properly we create new handlers that will work as a proxy to wrap parameters
        // Opra request (context) -> Nest (req, res, next, context: QueryRequestContext) -> Opra response (context)
        const paramArgsMetadata = Reflect.getMetadata(PARAM_ARGS_METADATA, instance.constructor, methodName);
        const hasParamsArgs = !!paramArgsMetadata;
        const patchedFn = instance[nestHandlerName] = function (...args: any[]) {
          if (hasParamsArgs)
            return endpointFunction.apply(this, args);
          return endpointFunction.call(this, args[3]);
        }
        if (paramArgsMetadata)
          Reflect.defineMetadata(PARAM_ARGS_METADATA, paramArgsMetadata, instance.constructor, nestHandlerName);

        // Copy all metadata from old Function to new one
        Reflect.getMetadataKeys(endpointFunction).forEach(k => {
          const m = Reflect.getMetadata(k, endpointFunction);
          Reflect.defineMetadata(k, m, patchedFn);
        });

        this._createContextCallback(instance, wrapper,
            rootModule, methodName, isRequestScoped, contextType);
      }
    });

    // Create api document
    return ApiDocumentFactory.createDocument(apiInit);
  }

  private _createHandler(callback: Function) {
    return function (ctx: opraCore.HttpContext) {
      switch (ctx.protocol) {
        case 'http':
          const httpContext = ctx.switchToHttp();
          return callback(httpContext.incoming, httpContext.outgoing, noOpFunction, ctx);
        default:
          throw new Error(`"${ctx.protocol}" context type is not implemented yet`)
      }
    };
  }

  private _createContextCallback(
      instance: object,
      wrapper: InstanceWrapper,
      moduleRef: Module,
      methodName: string,
      isRequestScoped: boolean,
      contextType: ContextType,
      options?: ExternalContextOptions
  ) {
    const paramsFactory = this.paramsFactory;
    const nestHandlerName = methodName + '_nestjs';

    const callback = isRequestScoped
        ? async (...args: any[]) => {
          const opraContext: opraCore.HttpContext =
              paramsFactory.exchangeKeyForValue(HandlerParamType.CONTEXT, undefined, args);
          const contextId = this.getContextId(opraContext);
          this.registerContextProvider(opraContext, contextId);
          const contextInstance = await this.injector.loadPerContext(
              instance,
              moduleRef,
              moduleRef.providers,
              contextId,
          );
          const contextCallback = this.externalContextCreator.create(
              contextInstance,
              contextInstance[methodName],
              nestHandlerName,
              PARAM_ARGS_METADATA,
              paramsFactory,
              contextId,
              wrapper.id,
              options,
              opraContext.protocol,
          );
          contextInstance[methodName] = this._createHandler(contextCallback);

          return contextCallback(...args);
        }
        : this.externalContextCreator.create<Record<number, ParamMetadata>, ContextType>(
            instance,
            instance[nestHandlerName],
            nestHandlerName,
            PARAM_ARGS_METADATA,
            paramsFactory,
            undefined,
            undefined,
            options,
            contextType,
        );
    instance[methodName] = this._createHandler(callback);
    return callback;
  }

  // noinspection JSMethodCanBeStatic
  private getContextId(gqlContext: Record<string | symbol, any>): ContextId {
    const numberOfArguments = getNumberOfArguments(ContextIdFactory.getByRequest);

    if (numberOfArguments === 2) {
      // @ts-ignore
      const contextId = ContextIdFactory.getByRequest(gqlContext, ['req']);
      if (!gqlContext[REQUEST_CONTEXT_ID as any]) {
        Object.defineProperty(gqlContext, REQUEST_CONTEXT_ID, {
          value: contextId,
          enumerable: false,
          configurable: false,
          writable: false,
        });
      }
      return contextId;
    } else {
      // TODO remove in the next version (backward-compatibility layer)
      // Left for backward compatibility purposes
      let contextId: ContextId;

      if (gqlContext && gqlContext[REQUEST_CONTEXT_ID]) {
        contextId = gqlContext[REQUEST_CONTEXT_ID];
      } else if (
          gqlContext &&
          gqlContext.req &&
          gqlContext.req[REQUEST_CONTEXT_ID]
      ) {
        contextId = gqlContext.req[REQUEST_CONTEXT_ID];
      } else {
        contextId = createContextId();
        Object.defineProperty(gqlContext, REQUEST_CONTEXT_ID, {
          value: contextId,
          enumerable: false,
          configurable: false,
          writable: false,
        });
      }

      return contextId;
    }
  }

  private registerContextProvider<T = any>(request: T, contextId: ContextId) {
    const coreModuleArray = [...this.modulesContainer.entries()]
        .filter(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([key, {metatype}]) => metatype && metatype.name === InternalCoreModule.name,
        )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(([key, value]) => value);

    const coreModuleRef = head(coreModuleArray);
    if (!coreModuleRef) {
      return;
    }
    const wrapper = coreModuleRef.getProviderByKey(REQUEST);
    wrapper.setInstanceByContextId(contextId, {
      instance: request,
      isResolved: true,
    });
  }

}

