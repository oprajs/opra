import { HttpController, HttpOperation } from '@opra/common';

@HttpController({
  description: 'Api root',
  path: '/',
})
export class RootController {
  @(HttpOperation({ path: 'ping' }).Response(200, {
    type: 'datetime',
  }))
  ping() {
    return new Date();
  }
}
