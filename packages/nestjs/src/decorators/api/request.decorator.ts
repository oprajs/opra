import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {OpraURL} from '@opra/url';
import {OpraRequest} from '../../common/request';

export function GetOpraRequest() {
  return createParamDecorator((data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const url = new OpraURL(req.url, req.serviceRoot);
    return new OpraRequest(url, 'collection');
  })();
}
