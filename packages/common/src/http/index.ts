export * from './opra-url.js';
export * from './opra-url-path.js';

export * from './enums/http-headers-codes.enum.js';
export * from './enums/http-status-codes.enum.js';
export * from './enums/http-status-messages.js';
export * from './enums/mime-types.enum.js';

type N1 = 1 | 2 | 3 | 4 | 5;
type N2 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'x';
export type HttpStatusRange = `${N1}${N2}${N2}`;
