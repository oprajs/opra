import { UseGuards } from '@nestjs/common';
import { HttpController, HttpOperation, OperationResult } from '@opra/common';
import { Db } from 'mongodb';
import { AppAuthGuard } from '../guards/app-auth.guard';
import { MyProfileController } from './my-profile.controller.js';

@HttpController({
  description: 'Auth controller',
  controllers: [MyProfileController],
  path: 'auth',
})
@UseGuards(AppAuthGuard)
export class AuthController {
  constructor(readonly db: Db) {}

  @HttpOperation({
    path: 'login',
  })
    .QueryParam('user', String)
    .QueryParam('password', 'string')
    .Response(200, { type: OperationResult })
  login() {
    return new OperationResult({
      message: 'You are logged in',
    });
  }

  @HttpOperation({
    path: '/logout',
  }).Response(200, { type: OperationResult })
  logout() {
    return new OperationResult({
      message: 'You are logged out',
    });
  }
}
