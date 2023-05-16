import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { OpraHttpClient } from '@opra/client';
import { ApiDocument } from '@opra/common';
import { IFileWriter } from '../interfaces/file-writer.interface.js';
import { ILogger } from '../interfaces/logger.interface.js';
import { FileWriter } from './file-writer.js';
import { processResources } from './process-resources.js';
import {
  generateComplexTypeDefinition,
  generateEnumTypeDefinition,
  generateMappedTypeDefinition,
  generateSimpleTypeDefinition,
  generateTypeFile,
  generateUnionTypeDefinition,
  processTypes,
  resolveTypeNameOrDef
} from './process-types.js';
import { TsFile } from './ts-file.js';

export namespace ApiExporter {
  export interface Config {
    serviceUrl: string;
    outDir: string,
    name?: string;
    cwd?: string;
    logger?: ILogger;
    writer?: IFileWriter;
    fileHeader?: string;
    importExt?: boolean;
  }
}


export class ApiExporter {
  protected client: OpraHttpClient;
  protected document: ApiDocument;
  protected logger: ILogger;
  protected outDir: string;
  protected cwd: string;
  protected serviceClassName?: string;
  protected fileHeader: string;
  protected writer: IFileWriter;
  protected files: Record<string, TsFile> = {};
  protected importExt?: boolean;
  // protected nsMap: ResponsiveMap<ApiExporter>;
  protected processResources: typeof processResources;
  protected processTypes: typeof processTypes;
  protected generateTypeFile: typeof generateTypeFile;
  protected generateComplexTypeDefinition: typeof generateComplexTypeDefinition;
  protected generateSimpleTypeDefinition: typeof generateSimpleTypeDefinition;
  protected resolveTypeNameOrDef: typeof resolveTypeNameOrDef;
  protected generateEnumTypeDefinition: typeof generateEnumTypeDefinition;
  protected generateUnionTypeDefinition: typeof generateUnionTypeDefinition;
  protected generateMappedTypeDefinition: typeof generateMappedTypeDefinition;

  protected constructor(
      config: ApiExporter.Config,
      // nsMap?: ResponsiveMap<ApiExporter> // implement references later
  ) {
    this.client = new OpraHttpClient(config.serviceUrl);
    this.cwd = config.cwd || process.cwd();
    this.outDir = path.resolve(this.cwd, config.outDir);
    this.logger = config.logger || {
      log: () => void 0,
      error: () => void 0,
      debug: () => void 0,
      warn: () => void 0,
      verbose: () => void 0,
    };
    this.fileHeader = config.fileHeader || '';
    this.writer = config.writer || new FileWriter();
    this.serviceClassName = config.name;
    this.importExt = config.importExt;
    // this.nsMap = nsMap || new ResponsiveMap(); // implement references later
  }

  protected async execute() {
    this.logger.log(chalk.yellow('Fetching service metadata from'), chalk.whiteBright(this.client.serviceUrl));
    this.document = await this.client.getMetadata();
    this.logger.log(chalk.yellow('Retrieved service info:\n'),
        chalk.white('Title:'), chalk.magenta(this.document.info.title), '\n',
        chalk.white('Version:'), chalk.magenta(this.document.info.version), '\n',
        chalk.white('Resources:'), chalk.magenta(this.document.resources.size), 'resources found\n',
        chalk.white('Types:'), chalk.magenta(this.document.types.size), 'types found\n',
    );
    this.serviceClassName = (this.serviceClassName || this.document.info.title || 'Service1').replace(/[^\w_$]*/g, '')
    this.serviceClassName = this.serviceClassName.charAt(0).toUpperCase() + this.serviceClassName.substring(1);

    this.fileHeader += `/* 
 * ${this.document.info.title} 
 * Version ${this.document.info.version}
 * ${this.client.serviceUrl}
*/`;

    this.logger.log(chalk.yellow('Removing old files..'));
    this.cleanDirectory(this.outDir);

    this.logger.log(chalk.yellow(`Generating service interface ( ${chalk.whiteBright(this.serviceClassName)} )`));
    fs.mkdirSync(this.outDir, {recursive: true});

    await this.processTypes();
    await this.processResources();

    const {importExt} = this;
    // Write files
    for (const file of Object.values(this.files)) {
      const targetDir = path.dirname(file.filename);
      fs.mkdirSync(targetDir, {recursive: true});
      await this.writer.writeFile(file.filename, file.generate({importExt}));
    }
  }

  protected getFile(filePath: string): TsFile {
    return this.files[path.resolve(path.join(this.outDir, filePath))];
  }

  protected addFile(filePath: string, returnExists?: boolean): TsFile {
    let file = this.getFile(filePath);
    if (file) {
      if (returnExists)
        return file;
      throw new Error(`File "${filePath}" already exists`);
    }
    file = new TsFile(path.resolve(path.join(this.outDir, filePath)));
    file.header = this.fileHeader;
    this.files[file.filename] = file;
    return file;
  }

  protected cleanDirectory(dirname: string) {
    if (!fs.existsSync(dirname))
      return;
    const files = fs.readdirSync(dirname);
    for (const f of files) {
      const absolutePath = path.join(dirname, f);
      if (fs.statSync(absolutePath).isDirectory()) {
        this.cleanDirectory(absolutePath);
        if (!fs.readdirSync(absolutePath).length)
          fs.rmdirSync(absolutePath);
        continue;
      }
      if (path.extname(f) === '.ts') {
        const contents = fs.readFileSync(absolutePath, 'utf-8');
        if (contents.includes('#!oprimp_auto_generated!#')) {
          fs.unlinkSync(absolutePath);
        }
      }
    }
  }

  static async execute(config: ApiExporter.Config): Promise<void> {
    const exporter = new ApiExporter(config);
    await exporter.execute();
  }

  static {
    ApiExporter.prototype.processResources = processResources;
    ApiExporter.prototype.processTypes = processTypes;
    ApiExporter.prototype.generateTypeFile = generateTypeFile;
    ApiExporter.prototype.generateComplexTypeDefinition = generateComplexTypeDefinition;
    ApiExporter.prototype.generateSimpleTypeDefinition = generateSimpleTypeDefinition;
    ApiExporter.prototype.resolveTypeNameOrDef = resolveTypeNameOrDef;
    ApiExporter.prototype.generateEnumTypeDefinition = generateEnumTypeDefinition;
    ApiExporter.prototype.generateUnionTypeDefinition = generateUnionTypeDefinition;
    ApiExporter.prototype.generateMappedTypeDefinition = generateMappedTypeDefinition;
  }

}
