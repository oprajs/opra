/* eslint-disable */
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import fetch, { Request, Response, Headers } from 'cross-fetch';

setupZoneTestEnv();
globalThis.fetch = fetch;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Headers = Headers;
