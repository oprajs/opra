import chalk from 'chalk';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { ApiDocument } from '@opra/common';
import { FileWriter } from '../file-writer.js';
import { IFileWriter } from '../interfaces/file-writer.interface.js';
import { ILogger } from '../interfaces/logger.interface.js';
import { cleanDirectory } from './processors/clean-directory.js';
import {
  generateComplexTypeDefinition,
  generateEnumTypeDefinition,
  generateMappedTypeDefinition,
  generateMixinTypeDefinition,
  generateSimpleTypeDefinition,
  processDataType,
  resolveTypeNameOrDef,
} from './processors/process-data-types.js';
import { processDocument } from './processors/process-document.js';
import { processHttpApi } from './processors/process-http-api.js';
import { processHttpController } from './processors/process-http-controller.js';
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
  }
}

/**
 * @class TsGenerator
 */
export class TsGenerator extends EventEmitter {
  protected cleanDirectory: typeof cleanDirectory;
  protected processDocument: typeof processDocument;
  protected processDataType: typeof processDataType;
  protected processHttpApi: typeof processHttpApi;
  protected processHttpController: typeof processHttpController;
  protected generateEnumTypeDefinition: typeof generateEnumTypeDefinition;
  protected generateComplexTypeDefinition: typeof generateComplexTypeDefinition;
  protected generateSimpleTypeDefinition: typeof generateSimpleTypeDefinition;
  protected generateMappedTypeDefinition: typeof generateMappedTypeDefinition;
  protected generateMixinTypeDefinition: typeof generateMixinTypeDefinition;
  protected resolveTypeNameOrDef: typeof resolveTypeNameOrDef;
  protected _started = false;
  protected _document?: ApiDocument;
  protected _documentRoot: string;
  protected _typesRoot: string;
  protected _apiPath: string;
  protected _fileHeaderDocInfo: string;
  protected _files: Record<string, TsFile> = {};
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
    this.options = { importExt: !!init.importExt };
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
      this.emit('log', chalk.cyan('Removing old files..'));
      this.cleanDirectory(this.outDir);
      this._apiPath = '/api';
      await this.processDocument();
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
    TsGenerator.prototype.processDocument = processDocument;
    TsGenerator.prototype.processDataType = processDataType;
    TsGenerator.prototype.processHttpApi = processHttpApi;
    TsGenerator.prototype.processHttpController = processHttpController;
    TsGenerator.prototype.generateEnumTypeDefinition = generateEnumTypeDefinition;
    TsGenerator.prototype.generateComplexTypeDefinition = generateComplexTypeDefinition;
    TsGenerator.prototype.generateSimpleTypeDefinition = generateSimpleTypeDefinition;
    TsGenerator.prototype.generateMappedTypeDefinition = generateMappedTypeDefinition;
    TsGenerator.prototype.generateMixinTypeDefinition = generateMixinTypeDefinition;
    TsGenerator.prototype.resolveTypeNameOrDef = resolveTypeNameOrDef;
  }
}
