import { Blob } from 'node:buffer';
import { Readable } from 'node:stream';
import web from 'node:stream/web';

/**
 * Wraps various input types into a Node.js Readable stream.
 */
export function toReadable(
  input:
    | Buffer
    | string
    | NodeJS.ReadableStream
    | NodeJS.WritableStream
    | Blob
    | Iterable<any>
    | AsyncIterable<any>
    | ((source: AsyncIterable<any>) => AsyncIterable<any>)
    | ((source: AsyncIterable<any>) => Promise<void>)
    | Promise<any>
    | web.ReadableWritablePair
    | web.ReadableStream
    | web.WritableStream,
): Readable {
  if (Buffer.isBuffer(input)) return Readable.from([input]);

  if (typeof input === 'string')
    return Readable.from([Buffer.from(input, 'utf-8')]);

  if (input instanceof Blob)
    return Readable.from(
      (async function* () {
        yield Buffer.from(await input.arrayBuffer());
      })(),
    );

  // Promise<any> — await and recurse with the resolved value
  if (typeof (input as any).then === 'function')
    return Readable.from(
      (async function* () {
        yield* toReadable(await (input as Promise<any>));
      })(),
    );

  // Transform function: (source) => AsyncIterable — call with empty source
  // Sink function: (source) => Promise<void> — produces no output, return empty stream
  if (typeof input === 'function') {
    const result = (input as Function)(Readable.from([]));
    if (result && typeof (result as any)[Symbol.asyncIterator] === 'function')
      return Readable.from(result as AsyncIterable<any>);
    return Readable.from([]);
  }

  // web.ReadableWritablePair — use the readable side
  if (
    input !== null &&
    typeof input === 'object' &&
    'readable' in input &&
    typeof (input as web.ReadableWritablePair).readable?.getReader ===
      'function'
  )
    return Readable.fromWeb((input as web.ReadableWritablePair).readable);

  // web.ReadableStream
  if (typeof (input as any).getReader === 'function')
    return Readable.fromWeb(input as web.ReadableStream<any>);

  // Node.js Readable
  if (input instanceof Readable) return input;

  // NodeJS.WritableStream or web.WritableStream that is also readable (Duplex / PassThrough)
  if (typeof (input as any).read === 'function')
    return input as unknown as Readable;

  // Iterable / AsyncIterable (fallback)
  return Readable.from(input as AsyncIterable<any>);
}
