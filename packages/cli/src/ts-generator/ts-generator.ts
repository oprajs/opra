import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { ApiDocument } from '@opra/common';
import colors from 'ansi-colors';
import { FileWriter } from '../file-writer.js';
import type { IFileWriter } from '../interfaces/file-writer.interface.js';
import type { ILogger } from '../interfaces/logger.interface.js';
import { cleanDirectory } from './generators/clean-directory.js';
import {
  _generateComplexTypeCode,
  _generateEnumTypeCode,
  _generateMappedTypeCode,
  _generateMixinTypeCode,
  _generateSimpleTypeCode,
  _generateTypeCode,
  generateDataType,
} from './generators/generate-data-type.js';
import { generateDocument } from './generators/generate-document.js';
import { generateHttpApi } from './generators/generate-http-api.js';
import { generateHttpController } from './generators/generate-http-controller.js';
import { TsFile } from './ts-file.js';

/**
 * @namespace TsGenerator
 */
export namespace TsGenerator {
  export interface Options {
    serviceUrl: string;
    outDir: string;
    cwd?: string;
    logger?: ILogger;
    writer?: IFileWriter;
    fileHeader?: string;
    importExt?: boolean;
    referenceNamespaces?: boolean;
  }
}

/**
 * @class TsGenerator
 */
export class TsGenerator extends EventEmitter {
  protected declare cleanDirectory: typeof cleanDirectory;
  protected declare generateDocument: typeof generateDocument;
  protected declare generateDataType: typeof generateDataType;
  protected declare _generateTypeCode: typeof _generateTypeCode;
  protected declare _generateEnumTypeCode: typeof _generateEnumTypeCode;
  protected declare _generateComplexTypeCode: typeof _generateComplexTypeCode;
  protected declare _generateSimpleTypeCode: typeof _generateSimpleTypeCode;
  protected declare _generateMappedTypeCode: typeof _generateMappedTypeCode;
  protected declare _generateMixinTypeCode: typeof _generateMixinTypeCode;
  protected declare generateHttpApi: typeof generateHttpApi;
  protected declare generateHttpController: typeof generateHttpController;
  protected declare _documentRoot: string;
  protected declare _typesRoot: string;
  protected declare _typesNamespace: string;
  protected declare _apiPath: string;
  protected declare _fileHeaderDocInfo: string;
  protected _files: Record<string, TsFile> = {};
  protected _started = false;
  protected _document?: ApiDocument;
  protected _documentsMap: Map<
    string,
    {
      document: ApiDocument;
      generator: TsGenerator;
    }
  >;
  protected _filesMap: WeakMap<Object, TsFile>;
  readonly serviceUrl: string;
  readonly outDir: string;
  readonly cwd: string;
  readonly writer: IFileWriter;
  readonly options: {
    importExt: boolean;
    referenceNamespaces?: boolean;
  };
  fileHeader: string;

  /**
   *
   * @constructor
   */
  constructor(init: TsGenerator.Options) {
    super();
    this.serviceUrl = init.serviceUrl;
    this.cwd = init.cwd || process.cwd();
    this.outDir = init.outDir ? path.resolve(this.cwd, init.outDir) : this.cwd;
    this.fileHeader = init.fileHeader || '';
    this.writer = init.writer || new FileWriter();
    this.options = { importExt: !!init.importExt, referenceNamespaces: init.referenceNamespaces };
    this._documentsMap = new Map();
    this._filesMap = new WeakMap();
    this.on('log', (message: string, ...args) => init.logger?.log?.(message, ...args));
    this.on('error', (message: string, ...args) => init.logger?.error?.(message, ...args));
    this.on('debug', (message: string, ...args) => init.logger?.debug?.(message, ...args));
    this.on('warn', (message: string, ...args) => init.logger?.warn?.(message, ...args));
    this.on('verbose', (message: string, ...args) => init.logger?.verbose?.(message, ...args));
  }

  async generate() {
    if (this._started) return;
    this.emit('start');
    try {
      this._started = true;
      this.emit('log', colors.cyan('Removing old files..'));
      this.cleanDirectory(this.outDir);
      this._apiPath = '/api';
      await this.generateDocument();
      const { importExt } = this.options;
      // Write files
      for (const file of Object.values(this._files)) {
        const filename = path.join(this.outDir, file.filename);
        const targetDir = path.dirname(filename);
        fs.mkdirSync(targetDir, { recursive: true });
        await this.writer.writeFile(filename, file.generate({ importExt }));
      }
    } catch (e) {
      this.emit('error', e);
      throw e;
    } finally {
      this.emit('finish');
    }
  }

  protected getFile(filePath: string): TsFile {
    return this._files[filePath];
  }

  protected addFile(filePath: string, returnExists?: boolean): TsFile {
    if (!(filePath.startsWith('.') || filePath.startsWith('/'))) filePath = './' + filePath;
    let file = this.getFile(filePath);
    if (file) {
      if (returnExists) return file;
      throw new Error(`File "${filePath}" already exists`);
    }
    file = new TsFile(filePath);
    file.code.header = this.fileHeader + (this._fileHeaderDocInfo ? '\n' + this._fileHeaderDocInfo : '') + '\n\n';
    this._files[file.filename] = file;
    return file;
  }

  protected extend(): TsGenerator {
    const instance = {
      options: { ...this.options },
    } as any;
    Object.setPrototypeOf(instance, this);
    return instance as TsGenerator;
  }

  static {
    TsGenerator.prototype.cleanDirectory = cleanDirectory;
    TsGenerator.prototype.generateDocument = generateDocument;
    TsGenerator.prototype.generateDataType = generateDataType;
    TsGenerator.prototype._generateTypeCode = _generateTypeCode;
    TsGenerator.prototype._generateEnumTypeCode = _generateEnumTypeCode;
    TsGenerator.prototype._generateComplexTypeCode = _generateComplexTypeCode;
    TsGenerator.prototype._generateSimpleTypeCode = _generateSimpleTypeCode;
    TsGenerator.prototype._generateMappedTypeCode = _generateMappedTypeCode;
    TsGenerator.prototype._generateMixinTypeCode = _generateMixinTypeCode;
    TsGenerator.prototype.generateHttpApi = generateHttpApi;
    TsGenerator.prototype.generateHttpController = generateHttpController;
  }
}
