import head from 'lodash.head';
import identity from 'lodash.identity';
import { ContextType, Inject, Injectable } from '@nestjs/common';
import { ContextIdFactory, createContextId, ModulesContainer, REQUEST } from '@nestjs/core';
import { ExternalContextCreator, ExternalContextOptions } from '@nestjs/core/helpers/external-context-creator';
import { ParamMetadata } from '@nestjs/core/helpers/interfaces/params-metadata.interface';
import { Injector } from '@nestjs/core/injector/injector';
import { ContextId, InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { InternalCoreModule } from '@nestjs/core/injector/internal-core-module';
import { Module } from '@nestjs/core/injector/module.js';
import { REQUEST_CONTEXT_ID } from '@nestjs/core/router/request/request-constants';
import { ApiDocument, DocumentFactory, METADATA_KEY, OpraSchema } from '@opra/common';
import { QueryRequestContext } from '@opra/core';
import { PARAM_ARGS_METADATA } from '../constants.js';
import { HandlerParamType } from '../enums/handler-paramtype.enum.js';
import { OpraModuleOptions } from '../interfaces/opra-module-options.interface.js';
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

  async generateService(rootModule: Module, moduleOptions: OpraModuleOptions, contextType: ContextType): Promise<ApiDocument> {
    const info: OpraSchema.DocumentInfo = {title: '', version: '', ...moduleOptions.info};
    info.title = info.title || 'Untitled service';
    info.version = info.version || '1';
    const resources: any[] = [];
    const apiSchema: DocumentFactory.InitArguments = {
      version: OpraSchema.SpecVersion,
      info,
      types: [],
      resources,
    };

    /*
     * Walk through modules and add Resource instances to the api schema
     */
    const wrappers = this.explorerService.exploreResourceWrappers(rootModule);
    for (const wrapper of wrappers) {
      const instance = wrapper.instance;
      const ctor = instance.constructor;
      const metadata = Reflect.getMetadata(METADATA_KEY, ctor);
      if (OpraSchema.isResource(metadata))
        resources.push(instance);
    }


    for (const wrapper of wrappers) {
      const instance = wrapper.instance;
      const ctor = instance.constructor;
      const resourceDef = Reflect.getMetadata(METADATA_KEY, ctor);
      /* istanbul ignore next */
      if (!resourceDef)
        continue;

      resources.push(instance);

      /* Wrap resolver functions */
      const prototype = Object.getPrototypeOf(instance);
      const isRequestScoped = !wrapper.isDependencyTreeStatic();
      // const methodsToWrap = OpraSchema.isCollectionResource(resourceDef) ? collectionMethods : [];
      if ((OpraSchema.isCollection(resourceDef) || OpraSchema.isSingleton(resourceDef)) && resourceDef.operations) {
        for (const opr of Object.values(resourceDef.operations)) {
          const {handlerName} = opr;
          const fn = prototype[handlerName];
          if (typeof fn !== 'function')
            continue;
          // NestJs requires calling handler function in different order than Opra.
          // In NestJS, handler functions must be called with these parameters (req, res, next)
          // In Opra, handler functions must be called with these parameters (context)
          // To work handlers properly we create new handlers that will work as a proxy to wrap parameters
          // Opra request (context) -> Nest (req, res, next, context: QueryRequestContext) -> Opra response (context)

          const nestHandlerName = handlerName + '::nestjs';
          const paramArgsMetadata = Reflect.getMetadata(PARAM_ARGS_METADATA, instance.constructor, handlerName);
          const hasParamsArgs = !!paramArgsMetadata;
          const patchedFn = prototype[nestHandlerName] = function (...args: any[]) {
            if (hasParamsArgs)
              return fn.apply(this, args);
            return fn.call(this, args[3]);
          }
          if (paramArgsMetadata)
            Reflect.defineMetadata(PARAM_ARGS_METADATA, paramArgsMetadata, instance.constructor, nestHandlerName);

          // Copy all metadata from old Function to new one
          Reflect.getMetadataKeys(fn).forEach(k => {
            const m = Reflect.getMetadata(k, fn);
            Reflect.defineMetadata(k, m, patchedFn);
          });

          const callback = this._createContextCallback(instance, prototype, wrapper,
              rootModule, nestHandlerName, isRequestScoped, undefined, contextType);
          opr.handler = function (ctx: QueryRequestContext) {
            switch (ctx.type) {
              case 'http':
                const http = ctx.switchToHttp();
                const req = http.getRequest().getInstance();
                const res = http.getResponse().getInstance();
                return callback(req, res, noOpFunction, ctx);
              default:
                throw new Error(`"${ctx.type}" context type is not implemented yet`)
            }
          };
          Object.defineProperty(opr.handler, 'name', {
            configurable: false,
            writable: false,
            enumerable: true,
            value: handlerName
          });

        }
      }

      /*
            for (const methodName of methodsToWrap) {
              const fn = prototype[methodName];
              if (typeof fn !== 'function')
                continue;

              // We add special non-operational "prepare" method to prototype.
              // This allows us to call Guards, Interceptors etc, before calling handler method
              const oldPreFn = prototype['pre_' + methodName] = noOpFunction;
              // Copy all metadata info (guards, etc) from operation handler to new pre_xxx handler
              Reflect.getMetadataKeys(fn).forEach(k => {
                const metadata = Reflect.getMetadata(k, fn);
                Reflect.defineMetadata(k, metadata, oldPreFn);
              });
              const preCallback = this._createContextCallback(instance, prototype, wrapper,
                  rootModule, methodName, isRequestScoped, undefined, contextType, true
              );

              const newPreFn = instance['pre_' + methodName] = function (ctx: QueryRequestContext) {
                switch (ctx.type) {
                  case 'http':
                    const http = ctx.switchToHttp();
                    const req = http.getRequest().getInstance();
                    const res = http.getResponse().getInstance();
                    return preCallback(req, res, noOpFunction, ctx);
                  default:
                    throw new Error(`"${ctx.type}" context type is not implemented yet`)
                }
              };
              Object.defineProperty(newPreFn, 'name', {
                configurable: false,
                writable: false,
                enumerable: true,
                value: 'pre_' + methodName
              });

              if (!Reflect.hasMetadata(METHOD_PATCHED, fn)) {
                const hasParamsArgs = Reflect.hasMetadata(PARAM_ARGS_METADATA, instance.constructor, methodName);
                const patchedFn = prototype[methodName] = function (...args: any[]) {
                  if (hasParamsArgs)
                    return fn.apply(this, args);
                  return fn.call(this, args[3]);
                }
                Reflect.defineMetadata(METHOD_PATCHED, true, patchedFn);
                Reflect.getMetadataKeys(fn).forEach(k => {
                  const metadata = Reflect.getMetadata(k, fn);
                  Reflect.defineMetadata(k, metadata, patchedFn);
                });
              }

              const callback = this._createContextCallback(instance, prototype, wrapper,
                  rootModule, methodName, isRequestScoped, undefined, contextType, false);
              const newFn = instance[methodName] = function (ctx: SingleRequestContext) {
                switch (ctx.type) {
                  case 'http':
                    const http = ctx.switchToHttp();
                    const req = http.getRequest().getInstance();
                    const res = http.getResponse().getInstance();
                    return callback(req, res, noOpFunction, ctx);
                  default:
                    throw new Error(`"${ctx.type}" context type is not implemented yet`)
                }
              };
              Object.defineProperty(newFn, 'name', {
                configurable: false,
                writable: false,
                enumerable: true,
                value: methodName
              });
            }*/
    }

    // Create api document
    return DocumentFactory.createDocument(apiSchema);
  }

  private _createContextCallback(
      instance: object,
      prototype: object,
      wrapper: InstanceWrapper,
      moduleRef: Module,
      methodName: string,
      isRequestScoped: boolean,
      transform: Function = identity,
      contextType: ContextType,
      options?: ExternalContextOptions
  ) {
    const paramsFactory = this.paramsFactory;
    // const options = !forPre ?
    //     {guards: false, interceptors: false, filters: false} : undefined;

    // const fnName = forPre ? 'pre_' + methodName : methodName;

    if (isRequestScoped) {
      return async (...args: any[]) => {
        const opraContext: QueryRequestContext = paramsFactory.exchangeKeyForValue(HandlerParamType.CONTEXT, undefined, args);
        const contextId = this.getContextId(opraContext);
        this.registerContextProvider(opraContext, contextId);
        const contextInstance = await this.injector.loadPerContext(
            instance,
            moduleRef,
            moduleRef.providers,
            contextId,
        );
        const callback = this.externalContextCreator.create(
            contextInstance,
            transform(contextInstance[methodName]),
            methodName,
            PARAM_ARGS_METADATA,
            paramsFactory,
            contextId,
            wrapper.id,
            options,
            opraContext.type,
        );
        return callback(...args);
      };
    }
    return this.externalContextCreator.create<Record<number, ParamMetadata>, ContextType>(
        instance,
        prototype[methodName],
        methodName,
        PARAM_ARGS_METADATA,
        paramsFactory,
        undefined,
        undefined,
        options,
        contextType,
    );
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

