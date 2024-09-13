import nodeStream from 'node:stream';
import typeIs from '@browsery/type-is';
import { BadRequestError, InternalServerError, OpraHttpError } from '@opra/common';
import { Base64Decode } from 'base64-stream';
import byteParser from 'bytes';
import { parse as parseContentType } from 'content-type';
import { EventEmitter } from 'events';
import iconv from 'iconv-lite';
import { Writable } from 'stream';
import * as zlib from 'zlib';
import type { HttpIncoming } from '../interfaces/http-incoming.interface';

/**
 *
 * @namespace BodyReader
 */
export namespace BodyReader {
  export interface Options {
    limit?: number | string;
  }
}

type Callback = (...args: any[]) => any;

/**
 *
 * @class BodyReader
 */
export class BodyReader extends EventEmitter {
  limit?: number;
  protected _stream?: nodeStream.Readable;
  protected _buffer?: string | Buffer[];
  protected _completed? = false;
  protected _receivedSize = 0;
  protected cleanup: Callback;
  protected onAborted: Callback;
  protected onData: Callback;
  protected onEnd: Callback;

  constructor(
    readonly req: HttpIncoming,
    options?: BodyReader.Options,
  ) {
    super();
    this.onAborted = () => this._onAborted();
    this.onData = (chunk: Buffer | string) => this._onData(chunk);
    this.onEnd = (err: any) => this._onEnd(err);
    this.cleanup = () => this._cleanup();
    this.limit = options?.limit
      ? typeof options.limit === 'number'
        ? options.limit
        : byteParser(options.limit)
      : undefined;
  }

  async read() {
    /* istanbul ignore next */
    if (this._completed) {
      throw new InternalServerError({
        message: 'Stream already read',
        code: 'STREAM_ALREADY_READ',
      });
    }

    if (!this.req.readable) {
      throw new InternalServerError({
        message: 'Stream is not readable',
        code: 'STREAM_NOT_READABLE',
      });
    }

    return new Promise<string | Buffer | undefined>((resolve, reject) => {
      // eslint-disable-next-line prefer-const
      let sizeStream: nodeStream.Writable | undefined;

      this.once('finish', (error, data) => {
        if (sizeStream) this.req.unpipe(sizeStream);
        if (error) return reject(error);
        resolve(data);
      });

      /**
       * Check if a request has a request body.
       * A request with a body __must__ either have `transfer-encoding`
       * or `content-length` headers set.
       * http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.3
       */
      const contentLength = parseInt(this.req.headers['content-length'] || '0', 10);
      if (this.req.headers['transfer-encoding'] === undefined && !(contentLength && !isNaN(contentLength))) {
        return this.onEnd();
      }

      // check the length and limit options.
      // note: we intentionally leave the stream paused,
      // so users should handle the stream themselves.
      if (this.limit != null && contentLength != null && contentLength > this.limit) {
        return this.onEnd(
          new OpraHttpError(
            {
              message: 'Content Too Large',
              code: 'HTTP.CONTENT_TOO_LARGE',
              details: {
                length: contentLength,
                limit: this.limit,
              },
            },
            413,
          ),
        );
      }

      // Pipe to a Writable stream to count received bytes
      const _this = this;
      sizeStream = new Writable({
        write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
          if (_this._completed) return;
          _this._receivedSize += chunk.length;
          if (_this.limit != null && _this._receivedSize > _this.limit) {
            callback(
              new OpraHttpError(
                {
                  message: 'Content Too Large',
                  code: 'HTTP.CONTENT_TOO_LARGE',
                  details: {
                    limit: _this.limit,
                    received: _this._receivedSize,
                  },
                },
                413,
              ),
            );
          }
        },
      });
      this.req.pipe(sizeStream);

      let stream = BodyReader.encoderPipeline(this.req);
      const mediaType = parseContentType(this.req.headers['content-type'] || '');
      let charset = (mediaType.parameters.charset || '').toLowerCase();
      if (!charset && typeIs.is(mediaType.type, ['json', 'xml', 'txt'])) charset = 'utf-8';
      if (charset) {
        const newStream = iconv.decodeStream(charset) as any;
        stream.pipe(newStream);
        stream = newStream;
      }
      this._stream = stream;
      // attach listeners
      stream.on('aborted', this.onAborted);
      stream.on('close', this.cleanup);
      stream.on('data', this.onData);
      stream.on('end', this.onEnd);
      stream.on('error', this.onEnd);
    });
  }

  protected _onEnd(error: any) {
    if (this._completed) return;
    this._completed = true;
    if (error) {
      this._stream?.unpipe();
      this._stream?.pause();
    }
    if (error) this.emit('finish', error);
    else if (Array.isArray(this._buffer)) this.emit('finish', error, Buffer.concat(this._buffer));
    else this.emit('finish', error, this._buffer);
    this._cleanup();
  }

  protected _cleanup() {
    if (this._stream) {
      this._stream.removeListener('aborted', this.onAborted);
      this._stream.removeListener('close', this.cleanup);
      this._stream.removeListener('data', this.onData);
      this._stream.removeListener('end', this.onEnd);
      this._stream.removeListener('error', this.onEnd);
    }
  }

  protected _onAborted() {
    if (this._completed) return;
    this.onEnd(
      new BadRequestError({
        message: 'request aborted',
        code: 'ECONNABORTED',
        details: {
          received: this._receivedSize,
        },
      }),
    );
  }

  protected _onData(chunk: Buffer | string) {
    if (this._completed) return;
    if (typeof chunk === 'string') {
      this._buffer = this._buffer || '';
      this._buffer += chunk;
    } else {
      this._buffer = this._buffer || [];
      (this._buffer as Buffer[]).push(chunk);
    }
  }

  static async read(req: HttpIncoming, options?: BodyReader.Options): Promise<string | Buffer | undefined> {
    const bodyReady = new BodyReader(req, options);
    return bodyReady.read();
  }

  protected static encoderPipeline(req: HttpIncoming): nodeStream.Readable {
    const contentEncoding: string = req.headers['content-encoding'] || 'identity';
    const contentEncodings = (Array.isArray(contentEncoding) ? contentEncoding : contentEncoding.split(/\s*,\s*/))
      .map(s => s.toLowerCase())
      .reverse();
    return contentEncodings.reduce((prev: nodeStream.Readable, encoding: string) => {
      switch (encoding) {
        case 'gzip':
        case 'x-gzip': {
          const newStream = zlib.createGunzip();
          prev.pipe(newStream);
          return newStream;
        }
        case 'deflate':
        case 'x-deflate': {
          const newStream = zlib.createInflate();
          prev.pipe(newStream);
          return newStream;
        }
        case 'br': {
          const newStream = zlib.createBrotliDecompress();
          prev.pipe(newStream);
          return newStream;
        }
        case 'base64': {
          const newStream = new Base64Decode();
          prev.pipe(newStream);
          return newStream;
        }
        case 'identity':
          // prev.length = 0;
          return prev;
        default:
          throw new BadRequestError(
            {
              message: 'unsupported content encoding "' + encoding + '"',
              code: '',
              details: {
                encoding,
              },
            },
            415,
          );
      }
    }, req);
  }
}
