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
import { ExecutionContext as OpraExecutionContext, OpraService, RESOURCE_METADATA, SchemaGenerator } from '@opra/core';
import { OpraSchema } from '@opra/schema';
import { PARAM_ARGS_METADATA } from '../constants.js';
import { HandlerParamType } from '../enums/handler-paramtype.enum.js';
import { OpraModuleOptions } from '../interfaces/opra-module-options.interface.js';
import { NestExplorer } from '../services/nest-explorer.js';
import { getNumberOfArguments } from '../utils/function.utils.js';
import { OpraParamsFactory } from './params.factory.js';

const entityHandlers = ['search', 'create', 'read', 'update', 'updateMany', 'delete', 'deleteMany'];
const noOpFunction = () => void 0;

@Injectable()
export class ServiceFactory {
  private readonly paramsFactory = new OpraParamsFactory();
  private readonly injector = new Injector();
  @Inject()
  private readonly modulesContainer: ModulesContainer;
  @Inject()
  private readonly externalContextCreator: ExternalContextCreator;
  @Inject()
  private readonly explorerService: NestExplorer;

  async generateService(rootModule: Module, moduleOptions: OpraModuleOptions, contextType: ContextType): Promise<OpraService> {
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
      if (OpraSchema.isEntityResource(resourceDef)) {
        for (const methodName of entityHandlers) {
          const fn = instance[methodName];
          if (typeof fn === 'function') {
            const newFnName = 'pre_' + methodName;
            prototype[newFnName] = () => void 0;
            const callback = this._createContextCallback(
                instance,
                prototype,
                wrapper,
                rootModule,
                newFnName,
                isRequestScoped,
                undefined,
                contextType
            );
            const newFn = instance[newFnName] = (ctx: OpraExecutionContext) => {
              switch (ctx.type) {
                case 'http':
                  const http = ctx.switchToHttp();
                  return callback(
                      http.getRequest().getInstance(),
                      http.getResponse().getInstance(),
                      noOpFunction,
                      ctx);
                default:
                  throw new Error(`"${ctx.type}" context type is not implemented yet`)
              }
            };
            Object.defineProperty(newFn, 'name', {
              configurable: false,
              writable: false,
              enumerable: true,
              value: newFnName
            });
          }
        }
      }
    }
    return await OpraService.create(serviceArgs);
  }

  private _createContextCallback(
      instance: object,
      prototype: any,
      wrapper: InstanceWrapper,
      moduleRef: Module,
      methodName: string,
      isRequestScoped: boolean,
      transform: Function = _.identity,
      contextType: ContextType
  ) {
    const paramsFactory = this.paramsFactory;

    if (isRequestScoped) {
      return async (...args: any[]) => {
        const opraContext: OpraExecutionContext = paramsFactory.exchangeKeyForValue(HandlerParamType.CONTEXT, undefined, args);
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
            undefined, // contextOptions
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
        undefined, // contextOptions
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

