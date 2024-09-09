import { setUncaughtExceptionCaptureCallback } from 'node:process';

setUncaughtExceptionCaptureCallback(x => {
  console.error('Uncaught Exception:');
  console.error(x);
});
