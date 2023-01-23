/* eslint-disable */
import 'jest-preset-angular/setup-jest.mjs';
import fetch, {Headers, Request, Response} from 'cross-fetch';

globalThis.fetch = fetch;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Headers = Headers;
