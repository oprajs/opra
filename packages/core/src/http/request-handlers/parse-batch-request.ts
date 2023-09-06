
// async parseMultiPart(
//     context: TExecutionContext,
//     url: OpraURL,
//     headers: IncomingHttpHeaders,
//     input: Readable,
//     boundary: string
// ): Promise<BatchRequestContext> {
//   return await new Promise((resolve, reject) => {
//     let _resolved = false;
//     const dicer = new Dicer({boundary});
//     const doReject = (e) => {
//       if (_resolved) return;
//       _resolved = true;
//       reject(e);
//       taskQueue.clearQueue();
//       dicer.destroy();
//     }
//     const taskQueue = new TaskQueue({concurrency: 1});
//     taskQueue.on('error', doReject);
//
//     const queries: SingleRequestContext[] = [];
//     let partCounter = 0;
//     dicer.on('error', doReject);
//     dicer.on('part', part => {
//       const partIndex = partCounter++;
//       let header: any;
//       const chunks: Buffer[] = [];
//       part.on('error', doReject);
//       part.on('header', (_header) => header = normalizeHeaders(_header));
//       part.on('data', (chunk: Buffer) => chunks.push(chunk));
//       part.on('end', () => {
//         if (_resolved || !(header || chunks.length))
//           return;
//         const ct = header['content-type'];
//         if (ct === 'application/http') {
//           taskQueue.enqueue(async () => {
//             const data = Buffer.concat(chunks);
//             if (!(data && data.length))
//               return;
//             const r = HttpRequest.parse(data);
//             await callMiddlewares(r, [jsonBodyParser]);
//             const subUrl = new OpraURL(r.url);
//             const contentId = header && header['content-id'];
//             queries.push(this.parseSingleQuery({
//               context,
//               url: subUrl,
//               method: r.method,
//               headers: r.headers,
//               body: r.body,
//               contentId
//             }));
//           });
//         } else doReject(new BadRequestError({
//           message: 'Unaccepted "content-type" header in multipart data',
//           details: {
//             position: `${boundary}[${partIndex}]`
//           }
//         }))
//       });
//     });
//     dicer.on('finish', () => {
//       taskQueue.enqueue(() => {
//         if (_resolved) return;
//         _resolved = true;
//         const batch = new BatchRequestContext({
//           service: this.document,
//           context,
//           headers,
//           queries,
//           params: url.searchParams,
//           continueOnError: false
//         });
//         resolve(batch);
//       });
//     });
//     input.pipe(dicer);
//   });
// }


// protected async sendBatchResponse(context: TExecutionContext, requestContext: BatchRequestContext) {
//   const resp = context.getResponse();
//   resp.setStatus(HttpStatus.OK);
//   resp.setHeader(HttpHeaderCodes.Cache_Control, 'no-cache');
//   resp.setHeader(HttpHeaderCodes.Pragma, 'no-cache');
//   resp.setHeader(HttpHeaderCodes.Expires, '-1');
//   if (requestContext.headers) {
//     for (const [k, v] of Object.entries(requestContext.headers)) {
//       if (v)
//         resp.setHeader(k, v);
//     }
//   }
//   const boundary = 'batch_' + uuid();
//   resp.setHeader(HttpHeaderCodes.Content_Type, 'multipart/mixed;boundary=' + boundary);
//   resp.setHeader(HttpHeaderCodes.X_Opra_Version, OpraSchema.Version);
//
//   const bodyBuilder = new HttpMultipartData();
//
//   const chunks: any[] = [];
//   let msgIdx = 0;
//   for (const ctx of requestContext.queries) {
//     msgIdx++;
//     const out = this.createOutput(ctx);
//
//
//     // chunks.push('--' + boundary + CRLF);
//     // let s = 'Content-Type: application/http' + CRLF +
//     //     'Content-Transfer-Encoding: binary' + CRLF +
//     //     'Content-ID:' + (ctx.contentId || msgIdx) + CRLF +
//     //     CRLF +
//     //     'HTTP/1.1 ' + out.status + (HttpStatus[out.status] || 'Unknown') + CRLF;
//
//     let body = out.body;
//     const headers = out.headers || {};
//     if (body) {
//       const contentType = String(headers['content-type'] || '').split(/\s*;\s*/);
//       let charset = '';
//       if (Highland.isStream(body)) {
//         const l = parseInt(String(headers['content-length']), 10);
//         if (isNaN(l))
//           throw new TypeError('"content-length" header required for streamed responses');
//       } else if (typeof body === 'object') {
//         if (typeof body.stream === 'function') { // File and Blob
//           contentType[0] = body.type || 'binary';
//           headers['content-length'] = String(body.size);
//           body = body.stream();
//         } else if (Buffer.isBuffer(body)) {
//           headers['content-length'] = String(body.length);
//         } else {
//           contentType[0] = contentType[0] || 'application/json';
//           charset = 'utf-8';
//           body = Buffer.from(JSON.stringify(body), 'utf-8');
//           headers['content-length'] = String(body.length);
//         }
//       } else {
//         contentType[0] = contentType[0] || 'text/plain';
//         charset = 'utf-8';
//         body = Buffer.from(String(body), 'utf-8');
//         headers['content-length'] = String(body.length);
//       }
//       if (contentType[0]) {
//         if (charset) {
//           const i = contentType.findIndex(x => CHARSET_PATTERN.test(String(x)));
//           if (i > 0) contentType[i] = 'charset=' + charset;
//           else contentType.join('charset=' + charset);
//         }
//         headers['content-type'] = contentType.join(';');
//       }
//     }
//     for (const [k, v] of Object.entries(headers))
//       s += k + ': ' + (Array.isArray(v) ? v.join(';') : v) + CRLF
//
//     chunks.push(s + CRLF);
//
//     if (body) {
//       if (typeof body === 'string')
//         chunks.push(body + CRLF + CRLF);
//       else {
//         chunks.push(body);
//         chunks.push(CRLF + CRLF);
//       }
//     }
//   }
//
//   chunks.push('--' + boundary + '--' + CRLF);
//
//   resp.setHeader('content-type', 'multipart/mixed;boundary=' + boundary);
//   resp.send(Highland(chunks).flatten());
//   resp.end();
// }
