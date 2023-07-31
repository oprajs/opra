import { PassThrough, Readable } from 'stream';

export function concatReadable(...streams: Readable[]): Readable {
  const out = new PassThrough();
  const pipeNext = () => {
    const nextStream = streams.shift();
    if (nextStream) {
      nextStream.pipe(out, {end: false});
      nextStream.once('end', () => pipeNext());
    } else {
      out.end();
    }
  }
  pipeNext();
  return out;
}
