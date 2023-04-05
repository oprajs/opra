/* eslint-disable */
import 'jest-preset-angular/setup-jest.js';
import fetch, { Request, Response, Headers } from 'cross-fetch';

globalThis.fetch = fetch;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Headers = Headers;
