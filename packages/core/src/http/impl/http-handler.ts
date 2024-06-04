import { parse as parseContentType } from 'content-type';
import * as process from 'node:process';
import { asMutable } from 'ts-gems';
import { toArray, ValidationError, Validator, vg } from 'valgen';
import type { ErrorIssue } from 'valgen/typings/core/types';
import typeIs from '@browsery/type-is';
import {
  ApiDocument,
  BadRequestError,
  DocumentElement,
  HttpController,
  HttpHeaderCodes,
  HttpMediaType,
  HttpOperation,
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
  OpraSchema,
  translate,
} from '@opra/common';
import { kAssetCache } from '../../constants.js';
import type { HttpAdapter } from '../http-adapter.js';
import { HttpOutgoing } from '../interfaces/http-outgoing.interface.js';
import { wrapException } from '../utils/wrap-exception.js';
import { AssetCache } from './asset-cache.js';
import { HttpContext } from '../http-context';

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
    context?: string;
    typeName?: string;
    body?: any;
  }
}

/**
 * @class HttpHandler
 */
export class HttpHandler {
  protected [kAssetCache]: AssetCache;

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
              message: translate('error:RESPONSE_VALIDATION,', 'Response validation failed'),
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
      let responseValue: any;
      if (this.adapter.interceptors) {
        let i = 0;
        const next = async () => {
          const interceptor = this.adapter.interceptors[i++];
          if (interceptor) await interceptor(context, next);
          else responseValue = await this._executeRequest(context);
        };
        await next();
      } else responseValue = await this._executeRequest(context);

      if (!response.writableEnded)
        await this._sendResponse(context, responseValue).finally(() => {
          if (!response.writableEnded) response.end();
        });
    } catch (e: any) {
      if (e instanceof ValidationError) {
        e = new InternalServerError(
          {
            message: translate('error:RESPONSE_VALIDATION,', 'Response validation failed'),
            code: 'RESPONSE_VALIDATION',
            details: e.issues,
          },
          e,
        );
      } else e = wrapException(e);
      response.status(e.statusCode || e.status || HttpStatusCode.INTERNAL_SERVER_ERROR);
      response.contentType(MimeTypes.opra_response_json);
      await this._sendResponse(context, new OperationResult({ errors: [e] })).finally(() => {
        if (!response.finished) response.end();
      });
      // if (!outgoing.writableEnded) await this._sendErrorResponse(context.response, [error]);
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
    if (context.operation.requestBody?.immediateFetch) await context.getBody();
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
    let prmName: string = '';
    try {
      const onFail = (issue: ErrorIssue) => {
        issue.location = prmName;
        return issue;
      };
      /** prepare decoders */

      const getDecoder = (prm: HttpParameter): Validator => {
        let decode = this[kAssetCache].get<Validator>(prm, 'decode');
        if (!decode) {
          decode = prm.type?.generateCodec('decode') || vg.isAny();
          this[kAssetCache].set(prm, 'decode', decode);
        }
        return decode;
      };

      const paramsLeft = new Set([...operation.parameters, ...operation.owner.parameters]);

      /** parse cookie parameters */
      if (request.cookies) {
        for (prmName of Object.keys(request.cookies)) {
          const oprPrm = operation.findParameter(prmName, 'cookie');
          const cntPrm = operation.owner.findParameter(prmName, 'cookie');
          const prm = oprPrm || cntPrm;
          if (!prm) continue;
          if (oprPrm) paramsLeft.delete(oprPrm);
          if (cntPrm) paramsLeft.delete(cntPrm);
          const decode = getDecoder(prm);
          const v: any = decode(request.cookies[prmName], { coerce: true, label: prmName, onFail });
          if (v !== undefined) context.cookies[prmName] = v;
        }
      }

      /** parse headers */
      if (request.headers) {
        for (prmName of Object.keys(request.headers)) {
          const oprPrm = operation.findParameter(prmName, 'header');
          const cntPrm = operation.owner.findParameter(prmName, 'header');
          const prm = oprPrm || cntPrm;
          if (!prm) continue;
          if (oprPrm) paramsLeft.delete(oprPrm);
          if (cntPrm) paramsLeft.delete(cntPrm);
          const decode = getDecoder(prm);
          const v: any = decode(request.headers[prmName], { coerce: true, label: prmName, onFail });
          if (v !== undefined) context.headers[prmName] = v;
        }
      }

      /** parse path parameters */
      if (request.params) {
        for (prmName of Object.keys(request.params)) {
          const oprPrm = operation.findParameter(prmName, 'path');
          const cntPrm = operation.owner.findParameter(prmName, 'path');
          const prm = oprPrm || cntPrm;
          if (!prm) continue;
          if (oprPrm) paramsLeft.delete(oprPrm);
          if (cntPrm) paramsLeft.delete(cntPrm);
          const decode = getDecoder(prm);
          const v: any = decode(request.params[prmName], { coerce: true, label: prmName, onFail });
          if (v !== undefined) context.pathParams[prmName] = v;
        }
      }

      /** parse query parameters */
      const url = new URL(request.originalUrl || request.url || '/', 'http://tempuri.org');
      const { searchParams } = url;
      for (prmName of searchParams.keys()) {
        const oprPrm = operation.findParameter(prmName, 'query');
        const cntPrm = operation.owner.findParameter(prmName, 'query');
        const prm = oprPrm || cntPrm;
        if (!prm) continue;
        if (oprPrm) paramsLeft.delete(oprPrm);
        if (cntPrm) paramsLeft.delete(cntPrm);
        const decode = getDecoder(prm);
        let v: any = searchParams?.getAll(prmName)?.flat();
        if (prm.isArray) {
          v = decode(v, { coerce: true, label: prmName, onFail });
          if (!v.length) v = undefined;
        } else {
          v = decode(v[0], { coerce: true, label: prmName, onFail });
        }
        if (v !== undefined) context.queryParams[prmName] = v;
      }

      for (const prm of paramsLeft) {
        // Throw error for required parameters
        if (prm.required) {
          const decode = getDecoder(prm);
          decode(undefined, { coerce: true, label: String(prm.name), onFail });
        }
      }
    } catch (e: any) {
      if (e instanceof ValidationError) {
        e = new BadRequestError(
          {
            message: `Invalid parameter (${prmName}) value. ` + e.message,
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
    if (operation.requestBody?.content.length) {
      let mediaType: HttpMediaType | undefined;
      let contentType = request.header('content-type');
      if (contentType) {
        contentType = parseContentType(contentType).type;
        mediaType = operation.requestBody.content.find(mc => {
          return (
            mc.contentType && typeIs.is(contentType!, Array.isArray(mc.contentType) ? mc.contentType : [mc.contentType])
          );
        });
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
    const { operation, resource } = context;
    const handler = this[kAssetCache].get<Function>(operation, 'handler');
    if (!handler) throw new MethodNotAllowedError();
    return await handler.call(resource.instance, context);
  }

  /**
   *
   * @param context
   * @param responseValue
   * @protected
   */
  protected async _sendResponse(context: HttpContext, responseValue: any): Promise<void> {
    const { response } = context;
    const { document } = this.adapter;
    const responseArgs = this._determineResponseArgs(context, responseValue);

    const { operationResponse, statusCode } = responseArgs;
    let { contentType, body } = responseArgs;

    const operationResultType = document.node.getDataType(OperationResult);
    let operationResultEncoder = this[kAssetCache].get<Validator>(operationResultType, 'encode');
    if (!operationResultEncoder) {
      operationResultEncoder = operationResultType.generateCodec('encode');
      this[kAssetCache].set(operationResultType, 'encode', operationResultEncoder);
    }

    /** Validate response */
    if (operationResponse?.type) {
      if (!(body == null && statusCode === HttpStatusCode.NO_CONTENT)) {
        /** Generate encoder */
        let encode = this[kAssetCache].get<Validator>(operationResponse, 'encode');
        if (!encode) {
          encode = operationResponse.type.generateCodec('encode');
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
          if (body instanceof OperationResult) {
            body.payload = encode(body.payload);
            body = operationResultEncoder(body);
          } else body = encode(body);
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
  }

  /**
   *
   * @param context
   * @param body
   * @protected
   */
  protected _determineResponseArgs(context: HttpContext, body: any): HttpHandler.ResponseArgs {
    const { response, operation } = context;

    const hasBody = !!body;
    const statusCode =
      !hasBody && response.statusCode === HttpStatusCode.OK ? HttpStatusCode.NO_CONTENT : response.statusCode;
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

      if (operation.responses.length) {
        /** Filter available HttpOperationResponse instances according to status code. */
        const filteredResponses = operation.responses.filter(r =>
          r.statusCode.find(sc => sc.start <= statusCode && sc.end >= statusCode),
        );

        /** Throw InternalServerError if controller returns non-configured status code */
        if (!filteredResponses.length && statusCode < 400)
          throw new InternalServerError(
            `No responses defined for status code ${statusCode} in operation "${operation.name}"`,
          );

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
              if (!operationResponse)
                throw new InternalServerError(`Operation didn't configured to return "${contentType}" content`);
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
          if (!(body instanceof OperationResult))
            body = new OperationResult({
              payload: body,
            });
          if (
            (composition === 'Entity.Create' || composition === 'Entity.Update') &&
            composition &&
            body.affected == null
          )
            body.affected = 1;
          if (!responseArgs.context && operationResponse?.type) {
            let el: DocumentElement | undefined = operationResponse.type.owner;
            while (el) {
              if (el instanceof HttpOperationResponse) {
                responseArgs.context = el.owner.getDocumentPath() + `#responses[${el.owner.responses.indexOf(el!)}]`;
                break;
              }
              if (el instanceof HttpOperation || el instanceof HttpController) {
                responseArgs.context = el.getDocumentPath();
                break;
              }
              if (el instanceof ApiDocument) {
                responseArgs.context = '/';
                break;
              }
              el = el.owner;
            }
            responseArgs.typeName = operationResponse.type.embedded ? `[#embedded]` : operationResponse.type.name;
          }
          body.context = responseArgs.context;
          body.type = responseArgs.typeName;
          break;
        }
        case 'Entity.Delete':
        case 'Entity.DeleteMany':
        case 'Entity.UpdateMany': {
          if (!(body instanceof OperationResult))
            body = new OperationResult({
              affected: body,
            });
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
      }
    }

    if (responseArgs.contentType)
      if (responseArgs.contentType !== parsedContentType?.type)
        response.setHeader('content-type', responseArgs.contentType);
      else response.removeHeader('content-type');
    if (
      responseArgs.contentType &&
      body &&
      !(body instanceof OperationResult) &&
      typeIs.is(responseArgs.contentType!, [MimeTypes.opra_response_json])
    )
      body = new OperationResult({ payload: body });

    if (hasBody) responseArgs.body = body;
    return responseArgs;
  }

  async sendDocumentSchema(response: HttpOutgoing): Promise<void> {
    const { document } = this.adapter;
    response.setHeader('content-type', MimeTypes.json);
    /** Check if response cache exists */
    let responseBody = this[kAssetCache].get(document, '$schema-response');
    /** Create response if response cache does not exists */
    if (!responseBody) {
      const schema = document.toJSON();
      const dt = document.node.getComplexType('OperationResult');
      let encode = this[kAssetCache].get<Validator>(dt, 'encode');
      if (!encode) {
        encode = dt.generateCodec('encode');
        this[kAssetCache].set(dt, 'encode', encode);
      }
      const bodyObject = new OperationResult({
        payload: schema,
      });
      const body = encode(bodyObject);
      responseBody = JSON.stringify(body);
      this[kAssetCache].set(document, '$schema-response', responseBody);
    }
    response.end(responseBody);
  }

  async sendErrorResponse(response: HttpOutgoing, errors: any[]): Promise<void> {
    if (response.headersSent) {
      response.end();
      return;
    }
    if (!errors.length) errors.push(wrapException({ status: response.statusCode || 500 }));
    const { logger } = this.adapter;
    errors.forEach(x => {
      if (x instanceof OpraException) {
        switch (x.severity) {
          case 'fatal':
            logger.fatal(x);
            break;
          case 'warning':
            logger.warn(x);
            break;
          default:
            logger.error(x);
        }
      } else logger.fatal(x);
    });

    const wrappedErrors = errors.map(wrapException);
    // Sort errors from fatal to info
    wrappedErrors.sort((a, b) => {
      const i = IssueSeverity.Keys.indexOf(a.severity) - IssueSeverity.Keys.indexOf(b.severity);
      if (i === 0) return b.status - a.status;
      return i;
    });

    let status = response.statusCode || 0;
    if (!status || status < Number(HttpStatusCode.BAD_REQUEST)) {
      status = wrappedErrors[0].status;
      if (status < Number(HttpStatusCode.BAD_REQUEST)) status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    }
    response.statusCode = status;

    const { document } = this.adapter;
    const dt = document.node.getComplexType('OperationResult');
    let encode = this[kAssetCache].get<Validator>(dt, 'encode');
    if (!encode) {
      encode = dt.generateCodec('encode');
      this[kAssetCache].set(dt, 'encode', encode);
    }
    const { i18n } = this.adapter;
    const bodyObject = new OperationResult({
      errors: wrappedErrors.map(x => {
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
}
