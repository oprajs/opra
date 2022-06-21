import _ from 'lodash';
import {Inject} from '@nestjs/common';
import {
  ContextIdFactory,
  createContextId,
  MetadataScanner,
  ModulesContainer,
  REQUEST
} from '@nestjs/core';
import {ExternalContextCreator} from '@nestjs/core/helpers/external-context-creator';
import {ParamMetadata} from '@nestjs/core/helpers/interfaces/params-metadata.interface';
import {Injector} from '@nestjs/core/injector/injector';
import {ContextId, InstanceWrapper} from '@nestjs/core/injector/instance-wrapper';
import {InternalCoreModule} from '@nestjs/core/injector/internal-core-module';
import {Module} from '@nestjs/core/injector/module';
import {REQUEST_CONTEXT_ID} from '@nestjs/core/router/request/request-constants';
import {isCollectionResourceDef, OpraServiceHost, RESOURCE_METADATA} from '@opra/common';
import {PARAM_ARGS_METADATA} from '@opra/core';
import {OpraParamType} from '../enums/opra-paramtype.enum';
import {OpraParamsFactory} from '../factories/params.factory';
import {getNumberOfArguments} from '../utils/function-utils';
import {OpraContextType} from './opra-execution-context';

export class ExplorerService {

  private readonly paramsFactory = new OpraParamsFactory();
  private readonly injector = new Injector();
  @Inject()
  protected readonly metadataScanner: MetadataScanner;
  @Inject()
  private readonly modulesContainer: ModulesContainer;
  @Inject()
  private readonly externalContextCreator: ExternalContextCreator;

  exploreResources(rootModule: Module): InstanceWrapper[] {
    const wrappers: InstanceWrapper[] = [];
    deepScanModule(rootModule, (m: Module) => {
      for (const wrapper of m.providers.values()) {
        const instance = wrapper.instance;
        if (instance && typeof instance === 'object' && instance.constructor &&
          Reflect.hasMetadata(RESOURCE_METADATA, instance.constructor))
          wrappers.push(wrapper);
      }
    });
    return wrappers;
  }

  addResourcesToOpraService(rootModule: Module, serviceHost: OpraServiceHost): void {
    // Find all resource instances
    const wrappers = this.exploreResources(rootModule);

    for (const wrapper of wrappers) {
      const instance = wrapper.instance;
      const resourceDef = serviceHost.defineResource(instance.constructor);
      /* istanbul ignore next */
      if (!resourceDef)
        continue;

      /* Wrap resolver functions */
      const prototype = Object.getPrototypeOf(instance);
      const isRequestScoped = !wrapper.isDependencyTreeStatic();
      if (isCollectionResourceDef(resourceDef)) {
        for (const operationKind of Object.keys(resourceDef.operations)) {
          const resolverDef = resourceDef.operations[operationKind];
          const methodName = resolverDef.methodName || resolverDef.resolver.name || operationKind;
          const newFn = this.createContextCallback(
            instance,
            prototype,
            wrapper,
            rootModule,
            methodName,
            isRequestScoped,
            undefined,
          );
          resolverDef.resolver = newFn;
          Object.defineProperty(newFn, 'name', {
            configurable: false,
            writable: false,
            enumerable: true,
            value: methodName
          });
        }
      }
    }
  }

  createContextCallback(
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

function deepScanModule(module: Module, callback: (module: Module) => void) {
  for (const m of module.imports) {
    callback(m);
    deepScanModule(m, callback);
  }
}
