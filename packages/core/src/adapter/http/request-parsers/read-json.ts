import bodyParser from 'body-parser';
import { HttpServerRequest } from '@opra/core';

export function createJsonReader(options: {limit?: number}) {
  const parser = bodyParser.json({
    limit: options?.limit,
    type: 'json'
  });
  return (incoming: HttpServerRequest) => {
    return new Promise<any>((resolve, reject) => {
      const next = (error) => {
        if (error)
          return reject(error);
        resolve(incoming.body);
      }
      parser(incoming as any, {} as any, next)
    })
  }
}
