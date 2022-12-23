/**
 * Opra Client Response Class
 */
export interface HttpResponse<TData = any> {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  readonly contentId?: string | null;
  readonly data: TData;
}
