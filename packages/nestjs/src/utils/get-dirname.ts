import path from 'path';
import CallSite = NodeJS.CallSite;

export function getDirname(): string {
  const pst = Error.prepareStackTrace;
  Error.prepareStackTrace = function (_, stack) {
    Error.prepareStackTrace = pst;
    return stack;
  };

  const e = new Error();
  if (!e.stack)
    throw Error('Can not parse stack');
  const stack: CallSite[] = (e.stack as unknown as CallSite[]).slice(1);
  while (stack) {
    const frame = stack.shift();
    const filename = frame && frame.getFileName();
    if (filename)
      return path.dirname(filename).replace('file://', '');
  }
  throw Error('Can not parse stack');
}
