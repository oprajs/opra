import { OpraDocumentError } from './opra-document-error.js';

export namespace DocumentInitContext {
  export interface Options {
    maxErrors?: number;
    scopes?: string | string[];
  }
}

export class DocumentInitContext {
  path: string = '';
  error = new OpraDocumentError();
  maxErrors: number;
  showErrorDetails = true;
  scopes?: string[];

  constructor(options?: DocumentInitContext.Options) {
    this.maxErrors = options?.maxErrors || 0;
    this.error.message = '';
    this.scopes = options?.scopes
      ? Array.isArray(options.scopes)
        ? options?.scopes
        : [options?.scopes]
      : undefined;
  }

  addError(error: Error | OpraDocumentError.ErrorDetail | string) {
    if (!this.error.details.length) {
      if (error instanceof Error) this.error.stack = error.stack;
      else {
        const e = new Error();
        Error.captureStackTrace(e, this.addError);
        this.error.stack = e.stack;
      }
    }
    // @ts-ignore
    this.error.add({
      message: typeof error === 'string' ? error : error.message,
      path: this.path,
      ...(typeof error === 'object' ? error : undefined),
    });
    if (this.error.details.length >= this.maxErrors) throw this.error;
  }

  enter(path: string, fn: () => any) {
    const oldPath = this.path;
    this.path = this.path + path;
    try {
      return fn();
    } catch (e: any) {
      if (e !== this.error) {
        this.addError(e);
      }
    } finally {
      this.path = oldPath;
    }
  }

  async enterAsync(path: string, fn: () => any) {
    const oldPath = this.path;
    this.path = this.path + path;
    try {
      return await fn();
    } catch (e: any) {
      if (e !== this.error) this.addError(e);
    } finally {
      this.path = oldPath;
    }
  }

  extend<T>(args: T): this & T {
    const out = {
      ...args,
    };
    Object.setPrototypeOf(out, this);
    return out as any;
  }
}
