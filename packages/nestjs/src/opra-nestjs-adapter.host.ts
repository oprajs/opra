import { Application, NextFunction, Request, Response, Router } from 'express';
import * as nodePath from 'path';
import { ApiDocument, HttpController, NotFoundError } from '@opra/common';
import { classes, HttpAdapter } from '@opra/core';

const { HttpAdapterHost } = classes;

export class OpraNestAdapter extends HttpAdapterHost {
  // protected _platform: string = 'express';

  constructor() {
    super();
  }

  async init(document: ApiDocument, options?: HttpAdapter.Options) {
    await super.init(document, options);
  }
}
