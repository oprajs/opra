import _ from 'lodash';
import { ContextType, Inject, Injectable } from '@nestjs/common';
import { ContextIdFactory, createContextId, ModulesContainer, REQUEST } from '@nestjs/core';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { ParamMetadata } from '@nestjs/core/helpers/interfaces/params-metadata.interface';
import { Injector } from '@nestjs/core/injector/injector';
import { ContextId, InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { InternalCoreModule } from '@nestjs/core/injector/internal-core-module';
import { Module } from '@nestjs/core/injector/module.js';
import { REQUEST_CONTEXT_ID } from '@nestjs/core/router/request/request-constants';
import { QueryContext } from '@opra/core';
import { OpraApi, OpraSchema, RESOURCE_METADATA, SchemaGenerator } from '@opra/schema';
import { PARAM_ARGS_METADATA } from '../constants.js';
import { HandlerParamType } from '../enums/handler-paramtype.enum.js';
import { OpraModuleOptions } from '../interfaces/opra-module-options.interface.js';
import { NestExplorer } from '../services/nest-explorer.js';
import { getNumberOfArguments } from '../utils/function.utils.js';
import { OpraParamsFactory } from './params.factory.js';

const noOpFunction = () => void 0;
const entityMethods = ['search', 'count', 'create', 'get', 'update', 'updateMany', 'delete', 'deleteMany'];

const METHOD_PATCHED = 'ServiceFactory.method-patched';

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

  async generateService(rootModule: Module, moduleOptions: OpraModuleOptions, contextType: ContextType): Promise<OpraApi> {
    const info: OpraSchema.DocumentInfo = {title: '', version: '', ...moduleOptions.info};
    info.title = info.title || 'Untitled service';
    info.version = info.version || '1';
    const serviceArgs: SchemaGenerator.GenerateServiceArgs = {
      info,
      types: [],
      resources: [],
    };

    const wrappers = this.explorerService.exploreResourceWrappers(rootModule);
    for (const wrapper of wrappers) {
      const instance = wrapper.instance;
      const resourceDef = Reflect.getMetadata(RESOURCE_METADATA, instance.constructor);
      /* istanbul ignore next */
      if (!resourceDef)
        continue;

      serviceArgs.resources.push(instance);

      /* Wrap resolver functions */
      const prototype = Object.getPrototypeOf(instance);
      const isRequestScoped = !wrapper.isDependencyTreeStatic();
      const methodsToWrap = OpraSchema.isEntityResource(resourceDef) ? entityMethods : [];

      for (const methodName of methodsToWrap) {
        const fn = prototype[methodName];
        if (typeof fn !== 'function')
          continue;

        // We add special non-operational "prepare" method to prototype.
        // This allows us to call Guards, Interceptors etc, before calling handler method
        const oldPreFn = prototype['pre_' + methodName] = noOpFunction;
        // Copy all metadata info
        Reflect.getMetadataKeys(fn).forEach(k => {
          const metadata = Reflect.getMetadata(k, fn);
          Reflect.defineMetadata(k, metadata, oldPreFn);
        });

        const preCallback = this._createContextCallback(instance, prototype, wrapper,
            rootModule, methodName, isRequestScoped, undefined, contextType, true
        );
        const newPreFn = instance['pre_' + methodName] = function (ctx: QueryContext) {
          switch (ctx.type) {
            case 'http':
              const http = ctx.switchToHttp();
              const req = http.getRequestWrapper().getInstance();
              const res = http.getResponseWrapper().getInstance();
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
        const newFn = instance[methodName] = function (ctx: QueryContext) {
          switch (ctx.type) {
            case 'http':
              const http = ctx.switchToHttp();
              const req = http.getRequestWrapper().getInstance();
              const res = http.getResponseWrapper().getInstance();
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
      }
    }
    return await OpraApi.create(serviceArgs);
  }

  private _createContextCallback(
      instance: object,
      prototype: any,
      wrapper: InstanceWrapper,
      moduleRef: Module,
      methodName: string,
      isRequestScoped: boolean,
      transform: Function = _.identity,
      contextType: ContextType,
      forPre: boolean
  ) {
    const paramsFactory = this.paramsFactory;
    const options = !forPre ?
        {guards: false, interceptors: false, filters: false} : undefined;

    const fnName = forPre ? 'pre_' + methodName : methodName;

    if (isRequestScoped) {
      return async (...args: any[]) => {
        const opraContext: QueryContext = paramsFactory.exchangeKeyForValue(HandlerParamType.CONTEXT, undefined, args);
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
            transform(contextInstance[fnName]),
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
        prototype[fnName],
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

    const coreModuleRef = _.head(coreModuleArray);
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

