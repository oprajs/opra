import {
  ContextType,
  Controller,
  Inject,
  Injectable,
  type Type,
} from '@nestjs/common';
import { createContextId, ModulesContainer, REQUEST } from '@nestjs/core';
import {
  ExternalContextCreator,
  type ExternalContextOptions,
} from '@nestjs/core/helpers/external-context-creator';
import type { ParamMetadata } from '@nestjs/core/helpers/interfaces/params-metadata.interface';
import { Injector } from '@nestjs/core/injector/injector';
import type {
  ContextId,
  InstanceWrapper,
} from '@nestjs/core/injector/instance-wrapper';
import { InternalCoreModule } from '@nestjs/core/injector/internal-core-module';
import type { Module } from '@nestjs/core/injector/module.js';
import { REQUEST_CONTEXT_ID } from '@nestjs/core/router/request/request-constants';
import { PARAM_ARGS_METADATA } from '@nestjs/microservices/constants';
import { RPC_CONTROLLER_METADATA, type RpcController } from '@opra/common';
import type { ExecutionContext as OpraExecutionContext } from '@opra/core';
import { BaseOpraNestFactory } from './base-opra-nest-factory.js';
import { RpcParamsFactory } from './rpc-params.factory.js';

@Injectable()
export class RpcControllerFactory extends BaseOpraNestFactory {
  private _coreModuleRef?: Module;
  private readonly paramsFactory = new RpcParamsFactory();
  private readonly injector = new Injector();

  constructor(
    @Inject()
    private readonly modulesContainer: ModulesContainer,
    @Inject()
    private readonly externalContextCreator: ExternalContextCreator,
  ) {
    super();
  }

  wrapControllers(): Type[] {
    const out: Type[] = [];
    for (const { module, wrapper } of this.exploreControllers()) {
      const instance = wrapper.instance;
      const sourceClass = instance.constructor;
      const metadata: RpcController.Metadata = Reflect.getMetadata(
        RPC_CONTROLLER_METADATA,
        sourceClass,
      );
      const isRequestScoped = !wrapper.isDependencyTreeStatic();

      /** Create a new controller class */
      const newClass: Type = {
        [sourceClass.name]: class extends sourceClass {},
      }[sourceClass.name];
      /** Copy metadata keys from source class to new one */
      RpcControllerFactory.copyDecoratorMetadata(newClass, sourceClass);
      Controller()(newClass);
      out.push(newClass);

      if (metadata.operations) {
        for (const operationName of Object.keys(metadata.operations)) {
          // const orgFn: Function = sourceClass.prototype[operationName];
          newClass.prototype[operationName] = this._createContextCallback(
            instance,
            wrapper,
            module,
            operationName,
            isRequestScoped,
            'rpc',
          );
          Reflect.defineMetadata(
            PARAM_ARGS_METADATA,
            [REQUEST],
            instance.constructor,
            operationName,
          );
        }
      }
    }
    return out;
  }

  private _createContextCallback(
    instance: object,
    wrapper: InstanceWrapper,
    moduleRef: Module,
    methodName: string,
    isRequestScoped: boolean,
    contextType: ContextType,
    options?: ExternalContextOptions,
  ) {
    const paramsFactory = this.paramsFactory;
    if (isRequestScoped) {
      return async (opraContext: OpraExecutionContext) => {
        const contextId = createContextId();
        Object.defineProperty(opraContext, REQUEST_CONTEXT_ID, {
          value: contextId,
          enumerable: false,
          configurable: false,
          writable: false,
        });

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
          methodName,
          PARAM_ARGS_METADATA,
          paramsFactory,
          contextId,
          wrapper.id,
          options,
          opraContext.protocol,
        );
        return contextCallback(opraContext);
      };
    }

    return this.externalContextCreator.create<
      Record<number, ParamMetadata>,
      ContextType
    >(
      instance,
      instance[methodName],
      methodName,
      PARAM_ARGS_METADATA,
      paramsFactory,
      undefined,
      undefined,
      options,
      contextType,
    );
  }

  private registerContextProvider<T = any>(request: T, contextId: ContextId) {
    if (!this._coreModuleRef) {
      const coreModuleArray = [...this.modulesContainer.entries()]
        .filter(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([_, { metatype }]) =>
            metatype && metatype.name === InternalCoreModule.name,
        )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(([_, value]) => value);
      this._coreModuleRef = coreModuleArray[0];
    }

    if (!this._coreModuleRef) {
      return;
    }
    const wrapper = this._coreModuleRef.getProviderByKey(REQUEST);
    wrapper.setInstanceByContextId(contextId, {
      instance: request,
      isResolved: true,
    });
  }

  exploreControllers(): { module: Module; wrapper: InstanceWrapper }[] {
    const scannedModules = new Set<Module>();
    const controllers = new Set<any>();
    const scanModule = (module: Module) => {
      if (scannedModules.has(module)) return;
      scannedModules.add(module);
      for (const mm of module.imports.values()) {
        scanModule(mm);
      }
      for (const wrapper of module.controllers.values()) {
        if (
          wrapper.instance &&
          typeof wrapper.instance === 'object' &&
          wrapper.instance.constructor &&
          Reflect.getMetadata(
            RPC_CONTROLLER_METADATA,
            wrapper.instance.constructor,
          ) &&
          !controllers.has(wrapper)
        ) {
          controllers.add({ module, wrapper });
        }
        if (wrapper.host) scanModule(wrapper.host);
      }
    };
    for (const module of this.modulesContainer.values()) {
      scanModule(module);
    }
    return Array.from(controllers);
  }
}
