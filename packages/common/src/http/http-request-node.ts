import { HTTPParser } from 'http-parser-js';
import { Readable } from 'stream';

const crlfBuffer = Buffer.from('\r\n');
const kHeaders = Symbol('kHeaders');
const kHeadersCount = Symbol('kHeadersCount');
const kTrailers = Symbol('kTrailers');
const kTrailersCount = Symbol('kTrailersCount');

// todo: Check is this class should be in common library
export class HttpRequestNode extends Readable {
  httpVersionMajor: number;
  httpVersionMinor: number;
  httpVersion: string;
  complete: boolean;
  rawHeaders: string[];
  rawTrailers: string[];
  aborted = false;
  upgrade: boolean;
  url: string;
  originalUrl: string;
  method: string;
  shouldKeepAlive: boolean;
  data?: Buffer;
  body?: any;
  [kHeaders]: Record<string, string | string[]>;
  [kHeadersCount]: number;
  [kTrailers]: Record<string, string | string[]>;
  [kTrailersCount]: number;

  get headers(): Record<string, string | string[]> {
    if (!this[kHeaders])
      this[kHeaders] = arrayToHeaders(this.rawHeaders);
    return this[kHeaders];
  }

  get headersCount(): number {
    return this[kHeadersCount];
  }

  get trailers(): Record<string, string | string[]> {
    if (!this[kTrailers])
      this[kTrailers] = arrayToHeaders(this.rawTrailers);
    return this[kTrailers];
  }

  get trailersCount(): number {
    return this[kTrailersCount];
  }

  _read() {
    if (this.data) {
      this.push(this.data);
    }
    this.push(null);
  }

  static parse(input: Buffer): HttpRequestNode {
    const parser = new HTTPParser(HTTPParser.REQUEST);
    const out = new HttpRequestNode();
    const bodyChunks: Buffer[] = [];

    parser[HTTPParser.kOnHeadersComplete] = function (req) {
      out.shouldKeepAlive = req.shouldKeepAlive;
      out.upgrade = req.upgrade;
      out.method = HTTPParser.methods[req.method];
      out.url = req.url;
      out.originalUrl = req.url;
      out.httpVersionMajor = req.versionMajor;
      out.httpVersionMinor = req.versionMinor;
      out.httpVersion = req.versionMajor + '.' + req.versionMinor;
      out.rawHeaders = req.headers;
      out[kHeadersCount] = Math.ceil(req.headers.length / 2);
      out[kTrailersCount] = 0;
    };

    parser[HTTPParser.kOnBody] = function (chunk, offset, length) {
      bodyChunks.push(chunk.subarray(offset, offset + length));
    };

    // This is actually the event for trailers, go figure.
    parser[HTTPParser.kOnHeaders] = function (t) {
      out.rawTrailers = t;
      out[kTrailersCount] = Math.ceil(t.length / 2);
    };

    parser[HTTPParser.kOnMessageComplete] = function () {
      out.complete = true;
    };

    // Since we are sending the entire Buffer at once here all callbacks above happen synchronously.
    // The parser does not do _anything_ asynchronous.
    // However, you can of course call execute() multiple times with multiple chunks, e.g. from a stream.
    // But then you have to refactor the entire logic to be async (e.g. resolve a Promise in kOnMessageComplete and add timeout logic).
    parser.execute(input);
    if (!out.complete)
      parser.execute(crlfBuffer);
    parser.finish();

    if (!out.complete) {
      throw new Error('Could not parse request');
    }

    out.rawTrailers = out.rawTrailers || [];
    if (bodyChunks.length)
      out.data = Buffer.concat(bodyChunks);
    out.resume();
    return out;
  }

}

function arrayToHeaders(arr: string[]): Record<string, string | string[]> {
  const headers: Record<string, string | string[]> = {};
  for (let i = 0; i < arr.length; i++) {
    const k = arr[i].toLowerCase();
    const v = arr[++i];
    const trgV = headers[k];
    // Array header -- only Set-Cookie at the moment
    if (trgV && k === 'set-cookie') {
      const a: string[] = Array.isArray(trgV) ? trgV : [trgV];
      a.push(v);
      headers[k] = a;
    } else if (typeof trgV === 'string') {
      headers[k] += (k === 'cookie' ? '; ' : ', ') + v;
    } else
      headers[k] = v;
  }
  return headers;
}
