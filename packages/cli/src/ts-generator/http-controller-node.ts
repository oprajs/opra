export const httpControllerNodeScript = `import { kClient, OpraHttpClient } from '@opra/client';

const PARAM_PATTERN = /:\\w+/g;

export class HttpControllerNode {
  readonly [kClient]: OpraHttpClient;

  constructor(client: OpraHttpClient) {
    this[kClient] = client;
  }
  
  protected _prepareUrl(url: string, params: Record<string, any>): string {
    return url.replace(PARAM_PATTERN, s => {
      return params[s.substring(1)] || '';
    });
  }
}
`;
