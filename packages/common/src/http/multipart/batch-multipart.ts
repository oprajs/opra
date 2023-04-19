// import Highland from 'highland';
// import { Readable } from 'stream';
// import { uid } from 'uid';
// import { isReadable } from '../../helpers/index.js';
// import { HttpHeaderCodes } from '../enums/http-headers-codes.enum.js';
// import { HttpStatusCodes } from '../enums/http-status-codes.enum.js';
// import { normalizeHeaders } from '../utils/normalize-headers.js';
// import { HttpRequestContent, IHttpRequestContent } from './http-request-content.js';
// import { HttpResponseContent, IHttpResponseContent } from './http-response-content.js';
//
// const CRLF = '\r\n';
// const CHARSET_PATTERN = / *charset=./i;
//
// type Part = {
//   headers: Record<string, string | string[]>;
//   contentId?: string;
//   content: HttpRequestContent | HttpResponseContent | BatchMultipart;
// }
//
// export class BatchMultipart {
//   protected _parts: Part[] = [];
//   readonly boundary: string;
//
//   constructor() {
//     this.boundary = 'batch_' + uid(12);
//   }
//
//   addRequestPart(content: IHttpRequestContent, part?: {
//     contentId?: string;
//     headers?: Record<string, string | string[]>;
//   }): this {
//     const headers: any = {
//       ...normalizeHeaders(part?.headers || {}, true),
//       [HttpHeaderCodes.Content_Type]: 'application/http',
//       [HttpHeaderCodes.Content_Transfer_Encoding]: 'binary'
//     };
//     if (part?.contentId)
//       headers[HttpHeaderCodes.Content_ID] = part.contentId;
//     this._parts.push({
//       headers,
//       contentId: part?.contentId,
//       content: new HttpRequestContent(content)
//     });
//     return this;
//   }
//
//   addHttpResponse(content: IHttpResponseContent, part?: {
//     contentId?: string;
//     headers?: Record<string, string | string[]>;
//   }): this {
//     const headers: any = {
//       ...normalizeHeaders(part?.headers || {}, true),
//       [HttpHeaderCodes.Content_Type]: 'application/http',
//       [HttpHeaderCodes.Content_Transfer_Encoding]: 'binary'
//     };
//     if (part?.contentId)
//       headers[HttpHeaderCodes.Content_ID] = part.contentId;
//     this._parts.push({
//       headers,
//       contentId: part?.contentId,
//       content: new HttpResponseContent(content)
//     });
//     return this;
//   }
//
//   addBatch(batch: BatchMultipart, part?: {
//     contentId?: string;
//     headers?: Record<string, string | string[]>;
//   }): this {
//     const headers: any = {
//       ...normalizeHeaders(part?.headers || {}, true),
//       [HttpHeaderCodes.Content_Type]: 'application/http',
//       [HttpHeaderCodes.Content_Transfer_Encoding]: 'binary'
//     };
//     if (part?.contentId)
//       headers[HttpHeaderCodes.Content_ID] = part.contentId;
//     this._parts.push({
//       headers,
//       contentId: part?.contentId,
//       content: batch
//     });
//     return this;
//   }
//
//   stream(): NodeJS.ReadableStream {
//     const chunks: (Buffer | Readable)[] = [];
//     this._build(chunks);
//     return Highland(chunks).flatten().toNodeStream();
//   }
//
//   protected _build(target: (Buffer | Readable)[]) {
//     for (const part of this._parts) {
//       if (part.content instanceof HttpRequestContent || part.content instanceof HttpResponseContent) {
//         let contentBody = part.content.data;
//         let contentLength = 0;
//         const contentHeaders = normalizeHeaders(part.content.headers);
//         if (contentBody) {
//           const contentType = String(contentHeaders['content-type'] || '').split(/\s*;\s*/);
//           let charset = '';
//           if (isReadable(contentBody)) {
//             contentLength = parseInt(String(contentHeaders['content-length']), 10) || 0;
//             // const l = parseInt(String(contentHeaders['content-length']), 10);
//             // if (isNaN(l))
//             //   throw new TypeError('"content-length" header required for streamed responses');
//           } else if (typeof contentBody === 'object') {
//             if (typeof contentBody.stream === 'function') { // File and Blob
//               contentType[0] = contentBody.type || 'binary';
//               contentLength = contentBody.size;
//               contentBody = contentBody.stream();
//             } else if (Buffer.isBuffer(contentBody)) {
//               contentHeaders['content-length'] = String(contentBody.length);
//             } else {
//               contentType[0] = contentType[0] || 'application/json';
//               charset = 'utf-8';
//               contentBody = Buffer.from(JSON.stringify(contentBody), 'utf-8');
//               contentLength = contentBody.length;
//             }
//           } else {
//             contentType[0] = contentType[0] || 'text/plain';
//             charset = 'utf-8';
//             contentBody = Buffer.from(String(contentBody), 'utf-8');
//             contentLength = contentBody.length;
//           }
//           if (contentType[0]) {
//             if (charset) {
//               const i = contentType.findIndex(x => CHARSET_PATTERN.test(String(x)));
//               if (i > 0) contentType[i] = 'charset=' + charset;
//               else contentType.join('charset=' + charset);
//             }
//             contentHeaders['content-type'] = contentType.join(';');
//           }
//           if (contentLength)
//             contentHeaders['content-length'] = String(contentLength);
//         }
//
//         let s = '--' + this.boundary + CRLF;
//         for (const [k, v] of Object.entries(part.headers)) {
//           if (!(v === '' || v == null))
//             s += k + ': ' + (Array.isArray(v) ? v.join(';') : v) + CRLF;
//         }
//         s += CRLF;
//
//         if (part.content instanceof HttpRequestContent)
//           s += (part.content.method || 'GET').toUpperCase() + ' ' + part.content.url + ' HTTP/1.1' + CRLF;
//         else
//           s += 'HTTP/1.1 ' + part.content.status + (HttpStatusCodes[part.content.status] || 'Unknown') + CRLF;
//         if (part.content.headers) {
//           for (const [k, v] of Object.entries(part.content.headers)) {
//             if (v === '' || v == null)
//               continue;
//             if (k === 'set-cookie' && Array.isArray(v)) {
//               v.forEach(x => s += k + ': ' + x);
//             } else
//               s += k + ': ' + (Array.isArray(v) ? v.join(';') : v) + CRLF;
//           }
//         }
//         s += CRLF;
//         target.push(Buffer.from(s, 'utf-8'));
//
//         if (contentBody) {
//           target.push(contentBody);
//           target.push(Buffer.from(CRLF + CRLF));
//         }
//       } else throw new Error('Not implemented yet');
//     }
//     target.push(Buffer.from('--' + this.boundary + '--' + CRLF, 'utf-8'));
//   }
//
// }
