import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { OpraHttpClient } from '@opra/client';
import { ApiDocument } from '@opra/common';
import { IFileWriter } from '../interfaces/file-writer.interface.js';
import { ILogger } from '../interfaces/logger.interface.js';
import { FileWriter } from './file-writer.js';
import { processResource } from './process-resources.js';
import {
  generateComplexTypeDefinition,
  generateEnumTypeDefinition,
  generateMappedTypeDefinition,
  generateMixinTypeDefinition,
  generateSimpleTypeDefinition,
  generateTypeFile,
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
  protected processResource: typeof processResource;
  protected processTypes: typeof processTypes;
  protected generateTypeFile: typeof generateTypeFile;
  protected generateComplexTypeDefinition: typeof generateComplexTypeDefinition;
  protected generateSimpleTypeDefinition: typeof generateSimpleTypeDefinition;
  protected resolveTypeNameOrDef: typeof resolveTypeNameOrDef;
  protected generateEnumTypeDefinition: typeof generateEnumTypeDefinition;
  protected generateMixinTypeDefinition: typeof generateMixinTypeDefinition;
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
    this.logger.log(chalk.cyan('Fetching service metadata from'), chalk.whiteBright(this.client.serviceUrl));
    this.document = await this.client.getMetadata();
    this.logger.log(chalk.cyan('Retrieved service info:\n'),
        chalk.white('Title:'), chalk.whiteBright(this.document.info.title), '\n',
        chalk.white('Version:'), chalk.whiteBright(this.document.info.version), '\n'
    );
    this.serviceClassName = (this.serviceClassName || this.document.info.title || 'Service1').replace(/[^\w_$]*/g, '')
    this.serviceClassName = this.serviceClassName.charAt(0).toUpperCase() + this.serviceClassName.substring(1);

    this.fileHeader += `/* 
 * ${this.document.info.title} 
 * Version ${this.document.info.version}
 * ${this.client.serviceUrl}
*/`;

    this.logger.log(chalk.cyan('Removing old files..'));
    this.cleanDirectory(this.outDir);

    this.logger.log(chalk.cyan(`Generating service interface ( ${chalk.whiteBright(this.serviceClassName)} )`));
    fs.mkdirSync(this.outDir, {recursive: true});

    this.logger.log(chalk.cyan('Processing types'));
    await this.processTypes();

    this.logger.log(chalk.cyan('Processing resources'));
    const rootTs = this.addFile('/' + this.serviceClassName + '.ts');
    await this.processResource(this.document.root, this.serviceClassName, rootTs);

    const {importExt} = this;
    // Write files
    for (const file of Object.values(this.files)) {
      const filename = path.join(this.outDir, file.filename);
      const targetDir = path.dirname(filename);
      fs.mkdirSync(targetDir, {recursive: true});
      await this.writer.writeFile(filename, file.generate({importExt}));
    }
  }

  protected getFile(filePath: string): TsFile {
    return this.files[filePath];
  }

  protected addFile(filePath: string, returnExists?: boolean): TsFile {
    if (!(filePath.startsWith('.') || filePath.startsWith('/')))
      filePath = './' + filePath;
    let file = this.getFile(filePath);
    if (file) {
      if (returnExists)
        return file;
      throw new Error(`File "${filePath}" already exists`);
    }
    file = new TsFile(filePath);
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
    ApiExporter.prototype.processResource = processResource;
    ApiExporter.prototype.processTypes = processTypes;
    ApiExporter.prototype.generateTypeFile = generateTypeFile;
    ApiExporter.prototype.generateComplexTypeDefinition = generateComplexTypeDefinition;
    ApiExporter.prototype.generateSimpleTypeDefinition = generateSimpleTypeDefinition;
    ApiExporter.prototype.resolveTypeNameOrDef = resolveTypeNameOrDef;
    ApiExporter.prototype.generateEnumTypeDefinition = generateEnumTypeDefinition;
    ApiExporter.prototype.generateMixinTypeDefinition = generateMixinTypeDefinition;
    ApiExporter.prototype.generateMappedTypeDefinition = generateMappedTypeDefinition;
  }

}
