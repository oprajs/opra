import { BatchMultipart } from '@opra/common';
import { HttpRequestBuilder } from '../http-request-builder.js';
import { HttpResponse } from '../http-response.js';
import { CommonHttpRequestOptions, HttpRequestHandler, RawHttpRequest } from '../http-types.js';
import { mergeRawHttpRequests } from '../utils/merge-raw-http-requests.util.js';

export class BatchRequest extends HttpRequestBuilder {

  protected _results = new WeakMap<HttpRequestBuilder, { error?: Error, response?: HttpResponse }>();
  protected _listeners = new Set<((error: Error | undefined, response?: HttpResponse) => void)>();

  constructor(
      protected _handler: HttpRequestHandler,
      readonly requests: HttpRequestBuilder[],
      public options: CommonHttpRequestOptions = {}
  ) {
    super(_handler, options);

    requests.forEach(request => {
      // Overwrite the _execute method
      Object.defineProperty(request, '_execute', {
        writable: true,
        enumerable: false,
        configurable: true,
        value: () => {
          return new Promise((resolve, reject) => {
            const x = this._results.get(request);
            if (x) {
              if (x.error)
                return reject(x.error);
              return resolve(x.response);
            }
            const callback = (error, response) => {
              this._listeners.delete(callback);
              if (error)
                return reject(error);
              resolve(response);
            };
            this._listeners.add(callback);
          })
        }
      })
    });
  }

  prepare(): RawHttpRequest {
    const batch = this._buildBatchMultipart(this);
    const headers = {
      'content-type': 'multipart/mixed;boundary=' + batch.boundary
    }
    return mergeRawHttpRequests({
          method: 'POST',
          path: '/$batch',
          headers,
          body: batch.stream()
        },
        this.options.http
    );
  }

  protected _buildBatchMultipart(batch: BatchRequest): BatchMultipart {
    const multipart = new BatchMultipart();

    for (const req of batch.requests) {
      const prepared = req.prepare();

      if (req instanceof BatchRequest) {
        const subMultipart = this._buildBatchMultipart(req);
        multipart.addBatch(subMultipart);
        continue;
      }

      multipart.addRequestPart({
        method: prepared.method,
        url: prepared.path,
        headers: prepared.headers,
        data: prepared.body
      });
    }

    return multipart;
  }

  protected async _execute(): Promise<HttpResponse> {
    const req = this.prepare();
    const resp = await this._handler(req) as HttpResponse;
    return resp;
  }

}
