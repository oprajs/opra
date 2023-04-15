import { HeaderInfo, HTTPParser, ParserType } from 'http-parser-js';
import { HttpHeaders } from './http-headers.js';

const kHeaders = Symbol('kHeaders');
const kHeadersProxy = Symbol('kHeadersProxy');
const kTrailers = Symbol('kTrailers');
const kTrailersProxy = Symbol('kTrailersProxy');
const kOnHeaderReceived = Symbol('kOnHeaderReceived');
const kOnTrailersReceived = Symbol('kOnTrailersReceived');
const kOnBodyChunk = Symbol('kOnBodyChunk');
const kOnReadComplete = Symbol('kOnReadComplete');
const crlfBuffer = Buffer.from('\r\n');

export namespace HttpMessageHost {
  export interface Initiator {
    httpVersionMajor?: number;
    httpVersionMinor?: number;
    headers?: HttpHeaders.Initiator;
    trailers?: HttpHeaders.Initiator;
    rawHeaders?: string[];
    rawTrailers?: string[];
    body?: any;
  }
}

export abstract class HttpMessageHost {
  static kHeaders = kHeaders;
  static kHeadersProxy = kHeadersProxy;
  static kTrailers = kTrailers;
  static kTrailersProxy = kTrailersProxy;
  static kOnHeaderReceived = kOnHeaderReceived;
  static kOnTrailersReceived = kOnTrailersReceived;
  static kOnBodyChunk = kOnBodyChunk;
  static kOnReadComplete = kOnReadComplete;

  protected [kHeaders]: HttpHeaders;
  protected [kHeadersProxy]: any;
  protected [kTrailers]: HttpHeaders;
  protected [kTrailersProxy]: any;
  protected _httpVersion: string;
  protected _httpVersionMajor: number;
  protected _httpVersionMinor: number;
  protected _rawHeaders?: string[];
  protected _rawTrailers?: string[];
  protected _headersChanged?: boolean;
  protected _trailersChanged?: boolean;
  shouldKeepAlive?: boolean;
  protected _upgrade?: boolean;
  protected _bodyChunks?: Buffer[];
  protected _body?: Buffer | ArrayBuffer;
  protected _complete: boolean = false;

  protected constructor(init: HttpMessageHost.Initiator | Buffer | ArrayBuffer, parserType: ParserType) {
    this[kHeaders] = new HttpHeaders(undefined, {
      onChange: () => this._headersChanged = true
    });
    this[kTrailers] = new HttpHeaders(undefined, {
      onChange: () => this._trailersChanged = true
    });
    this._init(init, parserType);
  }

  get complete(): boolean {
    return this._complete;
  }

  get httpVersionMajor(): number {
    return this._httpVersionMajor;
  }

  get httpVersionMinor(): number {
    return this._httpVersionMinor;
  }

  get httpVersion(): string {
    return this._httpVersion;
  }

  get headers(): any {
    this._initHeaders();
    return this[kHeadersProxy];
  }

  get trailers(): any {
    this._initTrailers();
    return this[kTrailersProxy];
  }

  get rawHeaders(): string[] {
    this._buildRawHeaders();
    return this._rawHeaders as string[];
  }

  set rawHeaders(headers: string[]) {
    this[kHeadersProxy] = undefined;
    this._headersChanged = false;
    this._rawHeaders = headers;
  }

  get rawTrailers(): string[] {
    this._buildRawTrailers();
    return this._rawTrailers as string[];
  }

  set rawTrailers(trailers: string[]) {
    this[kTrailersProxy] = undefined;
    this._trailersChanged = false;
    this._rawTrailers = trailers;
  }

  get body(): any | undefined {
    if (!this.complete)
      throw new Error('Message has not been completed yet');
    if (!this._body && this._bodyChunks) {
      this._body = Buffer.concat(this._bodyChunks);
      this._bodyChunks = undefined;
    }
    return this._body;
  }

  get upgrade(): boolean | undefined {
    return this._upgrade;
  }

  getHeader(name: 'set-cookie' | 'Set-Cookie'): string[] | undefined
  getHeader(name: string): string | undefined
  getHeader(name: string) {
    if (!name)
      return;
    this._initHeaders();
    switch (name.toLowerCase()) {
      case 'referer':
      case 'referrer':
        return this[kHeaders].get(name) ||
            this[kHeaders].get('referrer') ||
            this[kHeaders].get('referer')
      default:
        return this[kHeaders].get(name);
    }
  }


  get(name: 'set-cookie' | 'Set-Cookie'): string[] | undefined;
  get(name: string): string | undefined;
  get(name: string): any {
    this._initHeaders();
    return this[kHeaders].get(name);
  }

  /**
   * Set header `field` to `val`,
   * or pass an object of header fields.
   *
   * Examples:
   *
   *    msg.setHeader('Foo', ['bar', 'baz']);
   *    msg.setHeader('Accept', 'application/json');
   *    msg.setHeader({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   *
   * @public
   */
  setHeader(name: 'set-cookie' | 'Set-Cookie', value: string | string[]): this;
  setHeader(name: string, value: number | string | string[]): this;
  setHeader(headers: HttpHeaders.Initiator): this;
  setHeader(arg0, arg1?): this {
    this._initHeaders();
    if (typeof arg0 === 'object')
      this[kHeaders].set(arg0);
    else this[kHeaders].set(arg0, arg1);
    return this;
  }

  /**
   * Set header `field` to `val`,
   * or pass an object of header fields.
   * Alias as msg.setHeader()
   * @public
   */
  set(name: 'set-cookie' | 'Set-Cookie', value: string | string[]): this
  set(name: string, value: number | string | string[]): this
  set(headers: Record<string, number | string | string[]>): this;
  set(arg0, arg1?): this {
    return this.setHeader(arg0, arg1);
  }

  getHeaders() {
    this._initHeaders();
    return this[kHeaders].toObject();
  }

  getHeaderNames(): string[] {
    this._initHeaders();
    return Array.from(this[kHeaders].keys());
  }

  hasHeader(name: string): boolean {
    this._initHeaders();
    return this[kHeaders].has(name);
  }

  removeHeader(name: string): void {
    this._initHeaders();
    this[kHeaders].delete(name);
  }


  setTimeout() {
    return this;
  }

  protected _init(init: HttpMessageHost.Initiator | Buffer | ArrayBuffer, parserType: ParserType) {
    if (Buffer.isBuffer(init) || init instanceof ArrayBuffer) {
      this._parseBuffer(init, parserType);
    } else {
      this._assign(init);
      this._complete = true;
    }
  }

  protected _assign(args: HttpMessageHost.Initiator) {
    this._httpVersionMajor = args?.httpVersionMajor ?? 1;
    this._httpVersionMinor = args?.httpVersionMinor ?? 1;
    this._httpVersion = this._httpVersionMajor + '.' + this._httpVersionMinor;
    this._rawHeaders = args.rawHeaders;
    this._rawTrailers = args.rawTrailers;
    if (args.headers)
      this[kHeaders].set(args.headers);
    if (args.trailers)
      this[kTrailers].set(args.trailers);
    this._body = args.body;
  }

  protected _parseBuffer(init: Buffer | ArrayBuffer, parserType: ParserType) {
    const parser = new HTTPParser(parserType);
    parser[HTTPParser.kOnHeadersComplete] = this[kOnHeaderReceived].bind(this);
    parser[HTTPParser.kOnBody] = this[kOnBodyChunk].bind(this);
    parser[HTTPParser.kOnHeaders] = this[kOnTrailersReceived].bind(this);
    parser[HTTPParser.kOnMessageComplete] = this[kOnReadComplete].bind(this);
    const buffer: Buffer = Buffer.from(init);
    let x = parser.execute(buffer);
    if (typeof x === 'object') throw x;
    if (!this.complete) {
      x = parser.execute(crlfBuffer);
      if (typeof x === 'object') throw x;
    }
    parser.finish();
  }

  protected _initHeaders() {
    if (!this[kHeadersProxy]) {
      this[kHeadersProxy] = this[kHeaders].getProxy();
      if (this._rawHeaders) {
        const src = this._rawHeaders;
        const l = Math.floor(src.length / 2);
        for (let n = 0; n <= l; n += 2) {
          this[kHeaders].append(src[n], src[n + 1]);
        }
      }
    }
  }

  protected _initTrailers() {
    if (!this[kTrailersProxy]) {
      this[kTrailersProxy] = this[kTrailers].getProxy();
      if (this._rawTrailers) {
        const src = this._rawTrailers;
        const l = Math.floor(src.length / 2);
        for (let n = 0; n <= l; n += 2) {
          this[kTrailers].append(src[n], src[n + 1]);
        }
      }
    }
  }

  protected _buildRawHeaders() {
    // Rebuild rawHeaders if headers object changed
    if (this._headersChanged || !this._rawHeaders) {
      this._headersChanged = false;
      this._rawHeaders = Object.entries(this.headers)
          .reduce((a, [k, v]) => {
            if (Array.isArray(v))
              v.forEach(x => a.push(k, String(x)));
            else
              a.push(k, String(v));
            return a;
          }, [] as string[])
    }
  }

  protected _buildRawTrailers() {
    // Rebuild rawHeaders if headers object changed
    if (this._trailersChanged || !this._rawTrailers) {
      this._trailersChanged = false;
      this._rawTrailers = Object.entries(this.trailers)
          .reduce((a, [k, v]) => {
            if (Array.isArray(v))
              v.forEach(x => a.push(k, String(x)));
            else
              a.push(k, String(v));
            return a;
          }, [] as string[])
    }
  }

  protected [kOnHeaderReceived](info: HeaderInfo) {
    this._httpVersionMajor = info.versionMajor;
    this._httpVersionMinor = info.versionMinor;
    this._httpVersion = this._httpVersionMajor + '.' + this._httpVersionMinor;
    this._rawHeaders = info.headers;
    this.shouldKeepAlive = info.shouldKeepAlive;
    this._upgrade = info.upgrade;
  }

  protected [kOnTrailersReceived](trailers: string[]) {
    this._rawTrailers = trailers;
  }

  protected [kOnBodyChunk](chunk: Buffer, offset: number, length: number) {
    this._bodyChunks = this._bodyChunks || [];
    this._bodyChunks.push(chunk.subarray(offset, offset + length));
  }

  protected [kOnReadComplete]() {
    this._complete = true;
  }

}
