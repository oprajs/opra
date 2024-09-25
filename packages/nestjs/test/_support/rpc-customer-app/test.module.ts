import { Module } from '@nestjs/common';
import { OpraKafkaModule } from '@opra/nestjs';
// import { APP_GUARD } from '@nestjs/core';
// import { APP_INTERCEPTOR } from '@nestjs/core/constants';
// import { ApplicationModule } from 'nestjs-express-mongo';
import { MailController } from './controllers/mail-controller.js';
import { SendMailDto } from './dto/send-mail.dto.js';
// import { TestGlobalGuard } from './guards/global.guard.js';
// import { LogCounterInterceptor } from './guards/log-counter.interceptor.js';

@Module({
  imports: [
    OpraKafkaModule.forRoot({
      name: 'test',
      controllers: [MailController],
      types: [SendMailDto],
      client: { brokers: ['localhost:9092'] },
    }),
  ],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useExisting: TestGlobalGuard,
  //   },
  //   TestGlobalGuard,
  //   {
  //     provide: APP_INTERCEPTOR,
  //     useExisting: LogCounterInterceptor,
  //   },
  //   LogCounterInterceptor,
  // ],
})
export class TestModule {}
