import { Express } from 'express';
import { from, Observable } from 'rxjs';
import { SuperAgentRequest } from 'superagent';
import supertest, { CallbackHandler } from 'supertest';
import {
  HttpEvent,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';

export function createHttpRequestInterceptorMock(app: Express) {
  const client = supertest(app);

  class HttpRequestInterceptorMock implements HttpInterceptor {

    intercept(request: HttpRequest<any>): Observable<HttpEvent<any>> {
      return from(
          (client.get as (url: string, callback?: CallbackHandler) => SuperAgentRequest)(request.url)
              .then(res => {
                return new HttpResponse({
                  status: res.status,
                  body: res.body,
                  headers: new HttpHeaders(res.headers),
                  url: request.url
                })
              })
      );
    }
  }

  Injectable()(HttpRequestInterceptorMock);

  return HttpRequestInterceptorMock;
}


