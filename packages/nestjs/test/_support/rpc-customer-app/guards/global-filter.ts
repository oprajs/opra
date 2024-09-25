import { Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch(HttpException)
export class GlobalExceptionFilter extends BaseExceptionFilter {
  static counter = 0;

  catch(exception: HttpException) {
    GlobalExceptionFilter.counter++;
    throw exception;
  }
}
