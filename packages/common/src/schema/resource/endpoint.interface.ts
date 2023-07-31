export interface Endpoint {
  description?: string;
  handler?: Endpoint.MethodHandler;
}

export namespace Endpoint {
  export type MethodHandler = (...args: any[]) => any;
}
