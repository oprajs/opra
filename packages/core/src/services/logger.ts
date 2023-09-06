import { ILogger } from '../interfaces/logger.interface.js';

export interface LoggerOptions {
  // context?: string;
  // timestamp?: boolean;
  instance?: ILogger;
}

export class Logger implements ILogger {
  protected _instance: ILogger;

  constructor(options: LoggerOptions = {}) {
    this._instance = options.instance ||
        (!(process.env.NODE_ENV || '').includes('test') ? globalThis.console : {});
  }

  info(message: any, ...optionalParams: any[]): void {
    (this._instance.info || this._instance.log)?.(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]): void {
    if (this._instance.error) {
      this._instance.error(message, ...optionalParams);
      return;
    }
    this.info(message, ...optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]): void {
    if (this._instance.fatal) {
      this._instance.fatal(message, ...optionalParams);
      return;
    }
    this.error(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): void {
    this._instance.warn?.(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]): void {
    this._instance.debug?.(message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]): void {
    this._instance.verbose?.(message, ...optionalParams);
  }
}
