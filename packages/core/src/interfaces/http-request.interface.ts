export interface HttpRequest {
  readonly method: string;
  readonly url: string;
  getHeader(name: string): string | undefined;
}
