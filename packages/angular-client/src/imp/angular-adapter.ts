import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { AxiosRequestConfig, AxiosResponse, ClientAdapter } from '@opra/client';
import { OpraException } from '@opra/exception';

export function createAngularAdapter(httpClient: HttpClient): ClientAdapter {
  return (config: AxiosRequestConfig): Promise<AxiosResponse> => {

    const method = (config.method || 'GET').toUpperCase();

    // HTTP basic authentication
    if (config.auth) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Basic ${Buffer.from(
          `${config.auth.username}:${config.auth.password}`
      ).toString('base64')}`;
    }

    const request = httpClient.request(method, config.url || 'http://localhost', {
      body: config.data,
      headers: config.headers as any,
      params: config.params,
      withCredentials: config.withCredentials,
      observe: 'response',
    });
    return request.pipe(
        catchError(handleFailure),
        map(handleSuccess(config, request))
    ).toPromise<AxiosResponse>();
  }
}

function handleSuccess<T>(
    config: AxiosRequestConfig,
    request: Observable<HttpResponse<Object>>
) {
  return (response: HttpResponse<T>): AxiosResponse<T> => {

    // Convert HttpHeaders to simple object
    const headers = response.headers
        .keys()
        .reduce((headersColl, headerKey) => {
          headersColl[headerKey] = response.headers.get(headerKey);
          return headersColl;
        }, {});
    const data = responseIsError(response) ? response.error : response.body;

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers,
      config,
      request
    };
  };
}

function handleFailure(response: HttpErrorResponse): Observable<never> {
  const error = (typeof response.error === 'object')
      ? new OpraException({
        message: response.message,
        ...response.error
      }).setStatus(response.status)
      : new OpraException({
        message: response.message
      }).setStatus(response.status);
  return throwError(error);
}


/**
 * HttpErrorResponse type guard
 * @param response
 */
function responseIsError(response: HttpResponseBase): response is HttpErrorResponse {
  return (<Object>response).hasOwnProperty('error');
}
