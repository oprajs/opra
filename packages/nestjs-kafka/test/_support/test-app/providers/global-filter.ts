import { Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch(HttpException)
export class GlobalExceptionFilter extends BaseExceptionFilter {
  static instanceCounter = 0;
  static callCounter = 0;

  constructor() {
    super();
    GlobalExceptionFilter.instanceCounter++;
  }

  catch(exception: HttpException) {
    GlobalExceptionFilter.callCounter++;
    throw exception;
  }
}
