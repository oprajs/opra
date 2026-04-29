import { type ArgumentsHost, Controller } from '@nestjs/common';
import { ExternalExceptionFilter } from '@nestjs/core/exceptions/external-exception-filter.js';
import {
  classes,
  type MQControllerDecorator,
  type WSControllerDecorator,
} from '@opra/common';
import WSControllerDecoratorFactory = classes.WSControllerDecoratorFactory;

const { MQControllerDecoratorFactory } = classes;

/* Augment ExternalExceptionFilter to prevent error logging for Opra controllers */
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

/* Augment MQControllerDecoratorFactory to automatically apply @Controller() decorator */
MQControllerDecoratorFactory.augment(
  (decorator: MQControllerDecorator, decoratorChain: Function[]) => {
    decoratorChain.push((_: any, target: Function) => {
      Controller()(target);
    });
  },
);

/* Augment WSControllerDecoratorFactory to automatically apply @Controller() decorator */
WSControllerDecoratorFactory.augment(
  (decorator: WSControllerDecorator, decoratorChain: Function[]) => {
    decoratorChain.push((_: any, target: Function) => {
      Controller()(target);
    });
  },
);
