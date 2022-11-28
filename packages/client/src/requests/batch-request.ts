import { AxiosRequestConfig } from 'axios';
import Highland from 'highland';
import { uid } from 'uid';
import { HeadersMap } from '@opra/common';
import { OpraURL } from '@opra/url';
import type { OpraClient } from '../client.js';
import { OpraClientRequest } from '../client-request.js';
import { ClientResponse, CommonQueryOptions, OpraBatchRequestOptions } from '../types.js';

export const CRLF = '\r\n';

export class BatchRequest<TResponse extends ClientResponse = ClientResponse> // todo
    extends OpraClientRequest<any, TResponse> {

  protected _results = new WeakMap<OpraClientRequest, { error?: Error, response?: ClientResponse }>();
  protected _listeners = new Set<((error: Error | undefined, response?: ClientResponse) => void)>();

  constructor(
      readonly client: OpraClient,
      readonly requests: OpraClientRequest[],
      send: (req: AxiosRequestConfig) => Promise<TResponse>,
      public options: OpraBatchRequestOptions & CommonQueryOptions = {}
  ) {
    super(client, send, options);

    requests.forEach(request => {
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
            const callback = (e, r) => {
              this._listeners.delete(callback);
              if (e)
                return reject(e);
              resolve(r);
            };
            this._listeners.add(callback);
          })
        }
      })
    });
  }

  prepare(): AxiosRequestConfig {
    const {boundary, stream} = buildBatchStream(this);
    const headers = {
      'Content-Type': 'multipart/mixed;boundary=' + boundary
    }
    const url = new OpraURL(this.client.serviceUrl);
    url.path.join('/$batch');
    return {
      method: 'POST',
      url: url.address,
      params: url.searchParams,
      headers,
      data: stream
    }
  }

  protected async _execute(): Promise<TResponse> {
    const req = this.prepare();
    return this._send(req);
  }

}

function buildBatchStream(batch: BatchRequest): {
  boundary: string;
  stream: Highland.Stream<any>;
} {
  const chunks: any[] = [];
  let batchIndex = 0;
  let level = 0;

  const processBatch = (_batch: BatchRequest): string => {
    const boundary = `batch_${++batchIndex}_L${level}_${uid(10)}`;

    for (const req of _batch.requests) {
      chunks.push('--' + boundary + CRLF);

      if (req instanceof BatchRequest) {
        const contentHeaderIndex = chunks.push('');
        chunks.push('Content-Transfer-Encoding: binary' + CRLF + CRLF);
        level++;
        const subBoundary = processBatch(req);
        level--;
        processBatch[contentHeaderIndex] = 'Content-Type: multipart/mixed;boundary=' + subBoundary + CRLF;
        continue;
      }

      const prepared = req.prepare();
      let s = 'Content-Type: application/http' + CRLF +
          'Content-Transfer-Encoding: binary' + CRLF +
          'Content-ID:' + req.id + CRLF +
          CRLF +
          (prepared.method || 'GET').toUpperCase() + ' ' + prepared.url + ' HTTP/1.1' + CRLF;

      const headers = new HeadersMap(prepared.headers);

      let data;
      let contentType = '';

      if (prepared.data) {
        if (typeof prepared.data === 'string') {
          contentType = 'text/plain; charset=utf-8';
          data = prepared.data;
        } else if (Highland.isStream(prepared.data) || Buffer.isBuffer(prepared.data)) {
          data = prepared.data;
        } else if (typeof prepared.data.stream === 'function') {
          contentType = prepared.data.type || 'binary';
          data = prepared.data.stream(); // File and Blob
        } else if (typeof prepared.data === 'object') {
          contentType = 'application/json; charset=utf-8';
          data = JSON.stringify(prepared.data);
        } else throw new TypeError(`Invalid data type ${typeof prepared.data}`);
      }

      if (contentType && !headers.has('Content-Type'))
        headers.set('Content-Type', contentType);
      headers.forEach((v, k) => {
        s += k + ': ' + (Array.isArray(v) ? v.join(';') : v) + CRLF
      });

      if (data) {
        if (typeof data === 'string')
          chunks.push(s + CRLF + data + CRLF + CRLF);
        else {
          chunks.push(s + CRLF);
          chunks.push(data);
          chunks.push(CRLF + CRLF);
        }
      } else chunks.push(s + CRLF + CRLF);
    }

    chunks.push('--' + boundary + '--' + CRLF);

    return boundary;
  }
  const boundary = processBatch(batch);

  return {boundary, stream: Highland(chunks).flatten()};
}
