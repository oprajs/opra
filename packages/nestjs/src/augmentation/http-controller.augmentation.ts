// import { Controller } from '@nestjs/common';
// import { DECORATOR, HttpController } from '@opra/common';
//
// /*
//   Overrides HttpController decorator function to call NestJS's Controller() when decorator called
//  */
// const oldHttpControllerDecorator = HttpController[DECORATOR];
// HttpController[DECORATOR] = function HttpControllerDecorator(options?: HttpController.Options) {
//   const opraControllerDecorator = oldHttpControllerDecorator(options);
//   const nestControllerDecorator = Controller({});
//   return (target: Function) => {
//     opraControllerDecorator(target);
//     nestControllerDecorator(target);
//   };
// };
