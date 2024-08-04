import * as process from 'node:process';
import typeIs from '@browsery/type-is';
import {
  BadRequestError,
  HttpHeaderCodes,
  HttpMediaType,
  HttpOperationResponse,
  HttpParameter,
  HttpStatusCode,
  InternalServerError,
  isBlob,
  isReadableStream,
  IssueSeverity,
  MethodNotAllowedError,
  MimeTypes,
  OperationResult,
  OpraException,
  OpraHttpError,
  OpraSchema,
} from '@opra/common';
import { parse as parseContentType } from 'content-type';
import { splitString } from 'fast-tokenizer';
import { asMutable } from 'ts-gems';
import { toArray, ValidationError, Validator, vg } from 'valgen';
import type { ErrorIssue } from 'valgen/typings/core/types';
import { kAssetCache } from '../constants';
import type { HttpAdapter } from './http-adapter';
import { HttpContext } from './http-context';
import { AssetCache } from './impl/asset-cache';
import { wrapException } from './utils/wrap-exception';

/**
 * @namespace
 */
export namespace HttpHandler {
  /**
   * @interface ResponseArgs
   */
  export interface ResponseArgs {
    statusCode: number;
    contentType?: string;
    operationResponse?: HttpOperationResponse;
    body?: any;
    projection?: string[] | '*';
  }
}

/**
 * @class HttpHandler
 */
export class HttpHandler {
  protected [kAssetCache]: AssetCache;
  onError?: (context: HttpContext, error: OpraException) => void | Promise<void>;

  constructor(readonly adapter: HttpAdapter) {
    this[kAssetCache] = adapter[kAssetCache];
  }

  /**
   * Main http request handler
   * @param context
   * @protected
   */
  async handleRequest(context: HttpContext): Promise<void> {
    const { response } = context;
    try {
      response.setHeader(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
      // Expose headers if cors enabled
      if (response.getHeader(HttpHeaderCodes.Access_Control_Allow_Origin)) {
        // Expose X-Opra-* headers
        response.appendHeader(
          HttpHeaderCodes.Access_Control_Expose_Headers,
          Object.values(HttpHeaderCodes).filter(k => k.toLowerCase().startsWith('x-opra-')),
        );
      }

      // Parse request
      try {
        await this.parseRequest(context);
      } catch (e: any) {
        if (e instanceof OpraException) throw e;
        if (e instanceof ValidationError) {
          throw new BadRequestError(
            {
              message: 'Response validation failed',
              code: 'RESPONSE_VALIDATION',
              details: e.issues,
            },
            e,
          );
        }
        throw new BadRequestError(e);
      }

      await this.adapter.emitAsync('request', context);

      // Call interceptors than execute request
      if (this.adapter.interceptors) {
        const interceptors = this.adapter.interceptors;
        let i = 0;
        const next = async () => {
          const interceptor = interceptors[i++];
          if (typeof interceptor === 'function') await interceptor(context, next);
          else if (typeof interceptor?.intercept === 'function') await interceptor.intercept(context, next);
          await this._executeRequest(context);
        };
        await next();
      } else await this._executeRequest(context);
    } catch (error: any) {
      let e = error;
      if (e instanceof ValidationError) {
        e = new InternalServerError(
          {
            message: 'Response validation failed',
            code: 'RESPONSE_VALIDATION',
            details: e.issues,
          },
          e,
        );
      } else e = wrapException(e);
      if (this.onError) await this.onError(context, error);
      context.errors.push(e);
      await this.sendResponse(context);
    } finally {
      await context.emitAsync('finish');
    }
  }

  /**
   *
   * @param context
   */
  async parseRequest(context: HttpContext): Promise<void> {
    await this._parseParameters(context);
    await this._parseContentType(context);
    if (context.operation?.requestBody?.immediateFetch) await context.getBody();
    /** Set default status code as the first status code between 200 and 299 */
    if (context.operation) {
      for (const r of context.operation.responses) {
        const st = r.statusCode.find(sc => sc.start <= 299 && sc.end >= 200);
        if (st) {
          context.response.status(st.start);
          break;
        }
      }
    }
  }

  /**
   *
   * @param context
   * @protected
   */
  protected async _parseParameters(context: HttpContext) {
    const { operation, request } = context;
    if (!operation) return;

    let key: string = '';
    try {
      const onFail = (issue: ErrorIssue) => {
        issue.location = key;
        return issue;
      };
      /** prepare decoders */

      const getDecoder = (prm: HttpParameter): Validator => {
        let decode = this[kAssetCache].get<Validator>(prm, 'decode');
        if (!decode) {
          decode = prm.type?.generateCodec('decode', { ignoreReadonlyFields: true }) || vg.isAny();
          this[kAssetCache].set(prm, 'decode', decode);
        }
        return decode;
      };

      const paramsLeft = new Set([...operation.parameters, ...operation.owner.parameters]);

      /** parse cookie parameters */
      if (request.cookies) {
        for (key of Object.keys(request.cookies)) {
          const oprPrm = operation.findParameter(key, 'cookie');
          const cntPrm = operation.owner.findParameter(key, 'cookie');
          const prm = oprPrm || cntPrm;
          if (!prm) continue;
          if (oprPrm) paramsLeft.delete(oprPrm);
          if (cntPrm) paramsLeft.delete(cntPrm);
          const decode = getDecoder(prm);
          const v: any = decode(request.cookies[key], { coerce: true, label: key, onFail });
          const prmName = typeof prm.name === 'string' ? prm.name : key;
          if (v !== undefined) context.cookies[prmName] = v;
        }
      }

      /** parse headers */
      if (request.headers) {
        for (key of Object.keys(request.headers)) {
          const oprPrm = operation.findParameter(key, 'header');
          const cntPrm = operation.owner.findParameter(key, 'header');
          const prm = oprPrm || cntPrm;
          if (!prm) continue;
          if (oprPrm) paramsLeft.delete(oprPrm);
          if (cntPrm) paramsLeft.delete(cntPrm);
          const decode = getDecoder(prm);
          const v: any = decode(request.headers[key], { coerce: true, label: key, onFail });
          const prmName = typeof prm.name === 'string' ? prm.name : key;
          if (v !== undefined) context.headers[prmName] = v;
        }
      }

      /** parse path parameters */
      if (request.params) {
        for (key of Object.keys(request.params)) {
          const oprPrm = operation.findParameter(key, 'path');
          const cntPrm = operation.owner.findParameter(key, 'path');
          const prm = oprPrm || cntPrm;
          if (!prm) continue;
          if (oprPrm) paramsLeft.delete(oprPrm);
          if (cntPrm) paramsLeft.delete(cntPrm);
          const decode = getDecoder(prm);
          const v: any = decode(request.params[key], { coerce: true, label: key, onFail });
          if (v !== undefined) context.pathParams[key] = v;
        }
      }

      /** parse query parameters */
      const url = new URL(request.originalUrl || request.url || '/', 'http://tempuri.org');
      const { searchParams } = url;
      for (key of searchParams.keys()) {
        const oprPrm = operation.findParameter(key, 'query');
        const cntPrm = operation.owner.findParameter(key, 'query');
        const prm = oprPrm || cntPrm;
        if (!prm) continue;
        if (oprPrm) paramsLeft.delete(oprPrm);
        if (cntPrm) paramsLeft.delete(cntPrm);
        const decode = getDecoder(prm);
        let values: any[] = searchParams?.getAll(key);
        const prmName = typeof prm.name === 'string' ? prm.name : key;
        if (values?.length && prm.isArray) {
          values = values.map(v => splitString(v, { delimiters: prm.arraySeparator, quotes: true })).flat();
          values = values.map(v => decode(v, { coerce: true, label: key, onFail }));
          if (values.length) context.queryParams[prmName] = values;
        } else {
          const v = decode(values[0], { coerce: true, label: key, onFail });
          if (values.length) context.queryParams[prmName] = v;
        }
      }

      for (const prm of paramsLeft) {
        key = String(prm.name);
        // Throw error for required parameters
        if (prm.required) {
          const decode = getDecoder(prm);
          decode(undefined, { coerce: true, label: String(prm.name), onFail });
        }
      }
    } catch (e: any) {
      if (e instanceof ValidationError) {
        throw new BadRequestError(
          {
            message: `Invalid parameter (${key}) value. ` + e.message,
            code: 'REQUEST_VALIDATION',
            details: e.issues,
          },
          e,
        );
      }
      throw e;
    }
  }

  /**
   *
   * @param context
   * @protected
   */
  protected async _parseContentType(context: HttpContext) {
    const { request, operation } = context;
    if (!operation) return;
    if (operation.requestBody?.content.length) {
      let mediaType: HttpMediaType | undefined;
      let contentType = request.header('content-type');
      if (contentType) {
        contentType = parseContentType(contentType).type;
        mediaType = operation.requestBody.content.find(
          mc =>
            mc.contentType &&
            typeIs.is(contentType!, Array.isArray(mc.contentType) ? mc.contentType : [mc.contentType]),
        );
      }
      if (!mediaType) {
        const contentTypes = operation.requestBody.content.map(mc => mc.contentType).flat();
        throw new BadRequestError(`Request body should be one of required content types (${contentTypes.join(', ')})`);
      }
      asMutable(context).mediaType = mediaType;
    }
  }

  /**
   *
   * @param context
   * @protected
   */
  protected async _executeRequest(context: HttpContext): Promise<any> {
    if (!context.operationHandler) throw new MethodNotAllowedError();
    const responseValue = await context.operationHandler.call(context.controllerInstance, context);
    const { response } = context;
    if (!response.writableEnded) {
      await this.sendResponse(context, responseValue).finally(() => {
        if (!response.writableEnded) response.end();
      });
    }
  }

  /**
   *
   * @param context
   * @param responseValue
   * @protected
   */
  async sendResponse(context: HttpContext, responseValue?: any): Promise<void> {
    if (context.errors.length) return this._sendErrorResponse(context);
    const { response } = context;
    const { document } = this.adapter;
    try {
      const responseArgs = this._determineResponseArgs(context, responseValue);

      const { operationResponse, statusCode } = responseArgs;
      let { contentType, body } = responseArgs;

      const operationResultType = document.node.getDataType(OperationResult);
      let operationResultEncoder = this[kAssetCache].get<Validator>(operationResultType, 'encode');
      if (!operationResultEncoder) {
        operationResultEncoder = operationResultType.generateCodec('encode', {
          ignoreWriteonlyFields: true,
          ignoreHiddenFields: true,
        });
        this[kAssetCache].set(operationResultType, 'encode', operationResultEncoder);
      }

      /** Validate response */
      if (operationResponse?.type) {
        if (!(body == null && (statusCode as HttpStatusCode) === HttpStatusCode.NO_CONTENT)) {
          /** Generate encoder */
          let encode = this[kAssetCache].get<Validator>(operationResponse, 'encode');
          if (!encode) {
            encode = operationResponse.type.generateCodec('encode', {
              partial: operationResponse.partial,
              projection: responseArgs.projection || '*',
              ignoreWriteonlyFields: true,
              ignoreHiddenFields: true,
              onFail: issue => `Response body validation failed: ` + issue.message,
            });
            if (operationResponse) {
              if (operationResponse.isArray) encode = vg.isArray(encode);
              this[kAssetCache].set(operationResponse, 'encode', encode);
            }
          }
          /** Encode body */
          if (operationResponse.type.extendsFrom(operationResultType)) {
            if (body instanceof OperationResult) body = encode(body);
            else {
              body.payload = encode(body.payload);
              body = operationResultEncoder(body);
            }
          } else {
            if (
              body instanceof OperationResult &&
              contentType &&
              typeIs.is(contentType, [MimeTypes.opra_response_json])
            ) {
              body.payload = encode(body.payload);
              body = operationResultEncoder(body);
            } else {
              body = encode(body);
            }
          }

          if (
            body instanceof OperationResult &&
            operationResponse.type &&
            operationResponse.type !== document.node.getDataType(OperationResult)
          ) {
            body.type = operationResponse.type.name ? operationResponse.type.name : '#embedded';
          }
        }
      } else if (body != null) {
        if (body instanceof OperationResult) {
          body = operationResultEncoder(body);
          contentType = MimeTypes.opra_response_json;
        } else if (Buffer.isBuffer(body)) contentType = MimeTypes.binary;
        else if (typeof body === 'object') {
          contentType = contentType || MimeTypes.json;
          if (typeof body.toJSON === 'function') body = body.toJSON();
        } else {
          contentType = contentType || MimeTypes.text;
          body = String(body);
        }
      }
      /** Set content-type header value if not set */
      if (contentType && contentType !== responseArgs.contentType) response.setHeader('content-type', contentType);

      response.status(statusCode);
      if (body == null) {
        response.end();
        return;
      }

      let x: any;
      if (Buffer.isBuffer(body) || isReadableStream(body)) x = body;
      else if (isBlob(body)) x = body.stream();
      else if (typeof body === 'object') x = JSON.stringify(body);
      else x = String(body);
      response.end(x);
    } catch (error: any) {
      context.errors.push(error);
      return this._sendErrorResponse(context);
    }
  }

  protected async _sendErrorResponse(context: HttpContext): Promise<void> {
    context.errors = this._wrapExceptions(context.errors);
    try {
      await this.adapter.emitAsync('error', context);
      context.errors = this._wrapExceptions(context.errors);
    } catch (e) {
      context.errors = this._wrapExceptions([e, ...context.errors]);
    }

    const { response, errors } = context;
    if (response.headersSent) {
      response.end();
      return;
    }

    let status = response.statusCode || 0;
    if (!status || status < Number(HttpStatusCode.BAD_REQUEST)) {
      status = errors[0].status;
      if (status < Number(HttpStatusCode.BAD_REQUEST)) status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    }
    response.statusCode = status;

    const { document } = this.adapter;
    const dt = document.node.getComplexType('OperationResult');
    let encode = this[kAssetCache].get<Validator>(dt, 'encode');
    if (!encode) {
      encode = dt.generateCodec('encode', { ignoreWriteonlyFields: true });
      this[kAssetCache].set(dt, 'encode', encode);
    }
    const { i18n } = this.adapter;
    const bodyObject = new OperationResult({
      errors: errors.map(x => {
        const o = x.toJSON();
        if (!(process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development')) delete o.stack;
        return i18n.deep(o);
      }),
    });
    const body = encode(bodyObject);

    response.setHeader(HttpHeaderCodes.Content_Type, MimeTypes.opra_response_json + '; charset=utf-8');
    response.setHeader(HttpHeaderCodes.Cache_Control, 'no-cache');
    response.setHeader(HttpHeaderCodes.Pragma, 'no-cache');
    response.setHeader(HttpHeaderCodes.Expires, '-1');
    response.setHeader(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
    response.send(JSON.stringify(body));
    response.end();
  }

  async sendDocumentSchema(context: HttpContext): Promise<void> {
    const { request, response } = context;
    const { document } = this.adapter;
    response.setHeader('content-type', MimeTypes.json);
    const url = new URL(request.originalUrl || request.url || '/', 'http://tempuri.org');
    const { searchParams } = url;
    const documentId = searchParams.get('id');
    const doc = documentId ? document.findDocument(documentId) : document;
    if (!doc) {
      context.errors.push(
        new BadRequestError({
          message: `Document with given id [${documentId}] does not exists`,
        }),
      );
      return this.sendResponse(context);
    }
    /** Check if response cache exists */
    let responseBody = this[kAssetCache].get(doc, `$schema`);
    /** Create response if response cache does not exists */
    if (!responseBody) {
      const schema = doc.export();
      responseBody = JSON.stringify(schema);
      this[kAssetCache].set(doc, `$schema`, responseBody);
    }
    response.end(responseBody);
  }

  /**
   *
   * @param context
   * @param body
   * @protected
   */
  protected _determineResponseArgs(context: HttpContext, body: any): HttpHandler.ResponseArgs {
    const { response, operation } = context;

    const hasBody = body != null;
    const statusCode =
      !hasBody && (response.statusCode as any) === HttpStatusCode.OK ? HttpStatusCode.NO_CONTENT : response.statusCode;
    /** Parse content-type header */
    const parsedContentType = hasBody && response.hasHeader('content-type') ? parseContentType(response) : undefined;
    let contentType = parsedContentType?.type;
    /** Estimate content type if not defined */
    if (hasBody && !contentType) {
      if (body instanceof OperationResult) contentType = MimeTypes.opra_response_json;
      else if (Buffer.isBuffer(body)) contentType = MimeTypes.binary;
    }
    let operationResponse: HttpOperationResponse | undefined;

    const cacheKey = `HttpOperationResponse:${statusCode}${contentType ? ':' + contentType : ''}`;
    let responseArgs = this[kAssetCache].get<HttpHandler.ResponseArgs>(response, cacheKey);
    if (!responseArgs) {
      responseArgs = { statusCode, contentType } as HttpHandler.ResponseArgs;

      if (operation?.responses.length) {
        /** Filter available HttpOperationResponse instances according to status code. */
        const filteredResponses = operation.responses.filter(r =>
          r.statusCode.find(sc => sc.start <= statusCode && sc.end >= statusCode),
        );

        /** Throw InternalServerError if controller returns non-configured status code */
        if (!filteredResponses.length && statusCode < 400) {
          throw new InternalServerError(
            `No responses defined for status code ${statusCode} in operation "${operation.name}"`,
          );
        }

        /** We search for content-type in filtered HttpOperationResponse array */
        if (filteredResponses.length) {
          /** If no response returned, and content-type has not been set (No response wants to be returned by operation) */
          if (!hasBody) {
            /** Find HttpOperationResponse with no content-type */
            operationResponse = filteredResponses.find(r => !r.contentType);
          }

          if (!operationResponse) {
            /** Find HttpOperationResponse according to content-type */
            if (contentType) {
              // Find HttpEndpointResponse instance according to content-type header
              operationResponse = filteredResponses.find(r => typeIs.is(contentType!, toArray(r.contentType)));
              if (!operationResponse) {
                throw new InternalServerError(`Operation didn't configured to return "${contentType}" content`);
              }
            } else {
              /** Select first HttpOperationResponse if content-type header has not been set */
              operationResponse = filteredResponses[0];
              if (operationResponse.contentType) {
                const ct = typeIs.normalize(
                  Array.isArray(operationResponse.contentType)
                    ? operationResponse.contentType[0]
                    : operationResponse.contentType,
                );
                if (typeof ct === 'string') responseArgs.contentType = contentType = ct;
                else if (operationResponse.type) responseArgs.contentType = MimeTypes.opra_response_json;
              }
            }
          }
          responseArgs.operationResponse = operationResponse;
          if (!operationResponse.statusCode.find(sc => sc.start <= statusCode && sc.end >= statusCode)) {
            responseArgs.statusCode = operationResponse.statusCode[0].start;
          }
        }
      }
      if (!hasBody) delete responseArgs.contentType;
      if (operation?.composition?.startsWith('Entity.')) {
        if (context.queryParams.projection) responseArgs.projection = context.queryParams.projection;
      }
      this[kAssetCache].set(response, cacheKey, { ...responseArgs });
    }

    /** Fix response value according to composition */
    const composition = operationResponse?.owner.composition;
    if (composition && body != null) {
      switch (composition) {
        case 'Entity.Create':
        case 'Entity.Get':
        case 'Entity.FindMany':
        case 'Entity.Update': {
          if (!(body instanceof OperationResult)) {
            body = new OperationResult({
              payload: body,
            });
          }
          if (
            (composition === 'Entity.Create' || composition === 'Entity.Update') &&
            composition &&
            body.affected == null
          ) {
            body.affected = 1;
          }
          break;
        }
        case 'Entity.Delete':
        case 'Entity.DeleteMany':
        case 'Entity.UpdateMany': {
          if (!(body instanceof OperationResult)) {
            body = new OperationResult({
              affected: body,
            });
          }
          body.affected =
            typeof body.affected === 'number'
              ? body.affected
              : typeof body.affected === 'boolean'
                ? body.affected
                  ? 1
                  : 0
                : undefined;
          break;
        }
        default:
          break;
      }
    }

    if (responseArgs.contentType && responseArgs.contentType !== parsedContentType?.type) {
      response.setHeader('content-type', responseArgs.contentType);
    }
    if (
      responseArgs.contentType &&
      body != null &&
      !(body instanceof OperationResult) &&
      typeIs.is(responseArgs.contentType!, [MimeTypes.opra_response_json])
    ) {
      body = new OperationResult({ payload: body });
    }

    if (hasBody) responseArgs.body = body;
    return responseArgs;
  }

  protected _wrapExceptions(exceptions: any[]): OpraHttpError[] {
    const wrappedErrors = exceptions.map(wrapException);
    if (!wrappedErrors.length) wrappedErrors.push(new InternalServerError());
    // Sort errors from fatal to info
    wrappedErrors.sort((a, b) => {
      const i = IssueSeverity.Keys.indexOf(a.severity) - IssueSeverity.Keys.indexOf(b.severity);
      if (i === 0) return b.status - a.status;
      return i;
    });
    return wrappedErrors;
  }
}
