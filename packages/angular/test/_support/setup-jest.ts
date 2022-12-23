import 'jest-preset-angular/setup-jest';
import fetch, { Headers, Request, Response } from 'cross-fetch';

globalThis.fetch = fetch;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Headers = Headers;


// import 'jest-preset-angular';
// import 'zone.js';
// import 'zone.js/testing';
// import { TestBed } from "@angular/core/testing";
// import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";
//
// TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// import 'zone.js';
// import 'zone.js/testing';
// import { TestBed } from "@angular/core/testing";
// import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";

// TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
