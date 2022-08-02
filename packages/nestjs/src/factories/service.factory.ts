import _ from 'lodash';
import { Inject, Injectable } from '@nestjs/common';
import { ContextIdFactory, createContextId, ModulesContainer, REQUEST } from '@nestjs/core';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { ParamMetadata } from '@nestjs/core/helpers/interfaces/params-metadata.interface';
import { Injector } from '@nestjs/core/injector/injector';
import { ContextId, InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { InternalCoreModule } from '@nestjs/core/injector/internal-core-module';
import { Module } from '@nestjs/core/injector/module.js';
import { REQUEST_CONTEXT_ID } from '@nestjs/core/router/request/request-constants';
import { OpraSchema } from '@opra/common';
import { OpraService,OpraFactory } from '@opra/core';
import { OpraParamType } from '../enums/opra-paramtype.enum.js';
import { OpraModuleOptions } from '../interfaces/opra-module-options.interface.js';
import { ExplorerService } from '../services/explorer.service.js';
import { OpraContextType } from '../services/opra-execution-context.js';
import { getNumberOfArguments } from '../utils/function-utils.js';
import { OpraParamsFactory } from './params.factory';

@Injectable()
export class ServiceFactory {
  private readonly paramsFactory = new OpraParamsFactory();
  private readonly injector = new Injector();
  @Inject()
  private readonly modulesContainer: ModulesContainer;
  @Inject()
  private readonly externalContextCreator: ExternalContextCreator;
  @Inject()
  private readonly explorerService: ExplorerService;

  generateService(rootModule: Module, moduleOptions: OpraModuleOptions): OpraService {
    const service: OpraFactory.CreateServiceArgs = {
      info: moduleOptions.info,
      types: [],
      resources: [],
    };

    const wrappers = this.explorerService.exploreResourceWrappers(rootModule);
    for (const wrapper of wrappers) {
      const instance = wrapper.instance;
      const resourceDef = service.resources.push(instance);
      /* istanbul ignore next */
      if (!resourceDef)
        continue;

      /* Wrap resolver functions */
      const prototype = Object.getPrototypeOf(instance);
      const isRequestScoped = !wrapper.isDependencyTreeStatic();
      if (OpraSchema.isEntityResource(resourceDef)) {
        for (const operationKind of Object.keys(resourceDef.operations)) {
          const resolverDef: OpraSchema.ResourceOperation = resourceDef.operations[operationKind];
          if (!resolverDef)
            continue;
          const methodName = resolverDef.resolver.name || operationKind;
          const newFn = this._createContextCallback(
              instance,
              prototype,
              wrapper,
              rootModule,
              methodName,
              isRequestScoped,
              undefined,
          );
          resolverDef.resolver = newFn;
          if (methodName && newFn.name !== methodName)
            Object.defineProperty(newFn, 'name', {
              configurable: false,
              writable: false,
              enumerable: true,
              value: methodName
            });
        }
      }
    }

    return service;
  }

  private _createContextCallback(
      instance: object,
      prototype: any,
      wrapper: InstanceWrapper,
      moduleRef: Module,
      methodName: string,
      isRequestScoped: boolean,
      transform: Function = _.identity,
  ) {
    const paramsFactory = this.paramsFactory;

    if (isRequestScoped) {
      return async (...args: any[]) => {
        const gqlContext = paramsFactory.exchangeKeyForValue(OpraParamType.CONTEXT, args);
        const contextId = this.getContextId(gqlContext);
        this.registerContextProvider(gqlContext, contextId);
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
            'opra',
        );
        return callback(...args);
      };
    }
    return this.externalContextCreator.create<Record<number, ParamMetadata>, OpraContextType>(
        instance,
        prototype[methodName],
        methodName,
        PARAM_ARGS_METADATA,
        paramsFactory,
        undefined,
        undefined,
        undefined, // contextOptions
        'opra',
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

