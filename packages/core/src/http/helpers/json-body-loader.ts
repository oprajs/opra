import bodyParser from 'body-parser';
import type { HttpServerRequest } from '../http-server-request.js';

type BodyLoaderFunction = (incoming: HttpServerRequest) => Promise<any>;

const bodyLoaderCache = new WeakMap<Object, BodyLoaderFunction>();

export function jsonBodyLoader(options?: bodyParser.OptionsJson, cachePoint?: Object): BodyLoaderFunction {
  let bodyLoader = cachePoint ? bodyLoaderCache.get(cachePoint) : undefined;
  if (bodyLoader)
    return bodyLoader;
  const parser = bodyParser.json({
    ...options,
    type: 'json'
  });
  bodyLoader = (incoming: any) => {
    return new Promise<any>((resolve, reject) => {
      const next = (error) => {
        if (error)
          return reject(error);
        resolve(incoming.body);
      }
      parser(incoming, {} as any, next)
    })
  }
  if (cachePoint)
    bodyLoaderCache.set(cachePoint, bodyLoader);
  return bodyLoader;
}
