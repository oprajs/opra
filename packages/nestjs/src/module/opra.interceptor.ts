import {Observable} from 'rxjs';
import {CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor} from '@nestjs/common';
import {ModuleRef} from '@nestjs/core';
import {OPRA_MODULE_OPTIONS} from './opra.constants';
import {OpraModuleOptions} from './opra.interface';

declare global {
  namespace Express {
    interface Request {
      globalPrefix: string;
    }
  }
}

@Injectable()
export class OpraInterceptor implements NestInterceptor {
  globalPrefix: string;

  constructor(@Inject(OPRA_MODULE_OPTIONS) private options: OpraModuleOptions,
              private moduleRef: ModuleRef) {
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (this.globalPrefix === undefined) {
      let globalPrefix = (this.moduleRef as any).container._applicationConfig.globalPrefix || '';
      if (globalPrefix && !globalPrefix.startsWith('/'))
        globalPrefix = '/' + globalPrefix;
      while (globalPrefix.endsWith('/'))
        globalPrefix = globalPrefix.substring(0, globalPrefix.length - 1);
      this.globalPrefix = globalPrefix;
    }
    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest();
      req.moduleRef = this.moduleRef;
      req.globalPrefix = this.globalPrefix;
      // req.serviceRoot = '/' + normalizePath(joinPath(this.globalPrefix || '', this.serviceRoot), true);
    }
    return next.handle();
  }
}
