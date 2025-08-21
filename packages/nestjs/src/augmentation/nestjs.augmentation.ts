import { type ArgumentsHost, Controller } from '@nestjs/common';
import { ExternalExceptionFilter } from '@nestjs/core/exceptions/external-exception-filter.js';
import { classes, type MQControllerDecorator } from '@opra/common';

const { MQControllerDecoratorFactory } = classes;

const oldCatchMethod = ExternalExceptionFilter.prototype.catch;
ExternalExceptionFilter.prototype.catch = function (
  exception: any,
  host: ArgumentsHost,
) {
  const opraContext = host.getArgByIndex(3);
  // Prevents error logging for all Opra controllers
  if (opraContext && opraContext.request && opraContext.response)
    throw exception;
  oldCatchMethod(exception, host);
};

MQControllerDecoratorFactory.augment(
  (decorator: MQControllerDecorator, decoratorChain: Function[]) => {
    decoratorChain.push((_: any, target: Function) => {
      Controller()(target);
    });
  },
);
