import accepts from 'accepts';
import { HeaderInfo, HTTPParser, ParserType } from 'http-parser-js';
import stream from 'stream';
import typeIs from 'type-is';
import { HttpMessageHost } from './http-message.host.js';
import { HttpRequestMessage } from './interfaces/http-request-message.interface.js';

export namespace HttpRequestMessageHost {
  export interface Initiator extends HttpMessageHost.Initiator {
    method: string;
    url: string;
    protocol?: string;
    baseUrl?: string;
    ip?: string;
    ips?: [];
  }
}

export interface HttpRequestMessageHost extends stream.Readable {

}

export class HttpRequestMessageHost extends HttpMessageHost implements HttpRequestMessage {
  protected _protocol?: string;
  method: string;
  url: string;
  baseUrl: string;
  ip: string;
  ips: string[];

  constructor(init: HttpRequestMessageHost.Initiator | Buffer | ArrayBuffer) {
    super(init, HTTPParser.REQUEST);
  }

  get hostname(): string {
    let host = this.get('X-Forwarded-Host') || this.get('Host');
    if (host && host.indexOf(',') !== -1) {
      // Note: X-Forwarded-Host is normally only ever a single value, but this is to be safe.
      host = host.substring(0, host.indexOf(',')).trimEnd();
    }
    if (!host) return '';
    // IPv6 literal support
    const offset = host[0] === '['
        ? host.indexOf(']') + 1
        : 0;
    const index = host.indexOf(':', offset);

    return index !== -1
        ? host.substring(0, index)
        : host;
  }

  get protocol(): string {
    if (this._protocol)
      return this._protocol;
    // Note: X-Forwarded-Proto is normally only ever a
    //       single value, but this is to be safe.
    const header = this.get('X-Forwarded-Proto');
    if (header) {
      const index = header.indexOf(',');
      return index !== -1
          ? header.substring(0, index).trim()
          : header.trim()
    }
    return 'http';
  }

  set protocol(v: string | undefined) {
    this._protocol = v;
  }

  get secure(): boolean {
    return this.protocol === 'https';
  }

  header(name: 'set-cookie' | 'Set-Cookie'): string[] | undefined
  header(name: string): string | undefined
  header(name: string): any {
    return this.getHeader(name);
  }

  accepts(): string[];
  accepts(type: string): string | false;
  accepts(type: string[]): string | false;
  accepts(...type: string[]): string | false;
  accepts(...type): any {
    const accept = accepts(this as any);
    // eslint-disable-next-line prefer-spread
    return accept.types.apply(accept, type);
  }

  acceptsCharsets(): string[];
  acceptsCharsets(charset: string): string | false;
  acceptsCharsets(charset: string[]): string | false;
  acceptsCharsets(...charset: string[]): string | false;
  acceptsCharsets(...charset): any {
    const accept = accepts(this as any);
    // eslint-disable-next-line prefer-spread
    return accept.charsets.apply(accept, charset);
  }

  acceptsEncodings(): string[];
  acceptsEncodings(encoding: string): string | false;
  acceptsEncodings(encoding: string[]): string | false;
  acceptsEncodings(...encoding: string[]): string | false;
  acceptsEncodings(...encoding): any {
    const accept = accepts(this as any);
    // eslint-disable-next-line prefer-spread
    return accept.encodings.apply(accept, encoding);
  }


  acceptsLanguages(): string[];
  acceptsLanguages(lang: string): string | false;
  acceptsLanguages(lang: string[]): string | false;
  acceptsLanguages(...lang: string[]): string | false;
  acceptsLanguages(...lang): any {
    const accept = accepts(this as any);
    // eslint-disable-next-line prefer-spread
    return accept.languages.apply(accept, lang);
  }

  is(type: string | string[], ...otherTypes: string[]): string | false | null {
    const types = Array.isArray(type) ? type : [type];
    if (otherTypes.length)
      types.push(...otherTypes);
    const contentType = this.getHeader('content-type');
    return contentType ? typeIs.is(contentType as any, types) : null;
  }

  protected _init(init: HttpMessageHost.Initiator | Buffer | ArrayBuffer, parserType: ParserType) {
    stream.Readable.apply(this);
    super._init(init, parserType);
  }

  protected _assign(init: HttpRequestMessageHost.Initiator) {
    super._assign(init);
    this.method = init.method.toUpperCase();
    this.url = init.url;
    this.baseUrl = init.baseUrl || this.url;
    this.protocol = init.protocol;
  }

  protected [HttpMessageHost.kOnHeaderReceived](info: HeaderInfo) {
    super[HttpMessageHost.kOnHeaderReceived](info);
    this.method = HTTPParser.methods[info.method];
    this.url = info.url;
    this.baseUrl = info.url;
  }

}
