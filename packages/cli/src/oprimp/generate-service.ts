import * as fs from 'fs';
import path from 'path';
import * as process from 'process';
import { OpraDocument } from '@opra/common';
import { IFileWriter } from '../interfaces/file-writer.interface.js';
import { ILogger } from '../interfaces/logger.interface.js';
import type { ServiceGenerationContext } from '../interfaces/service-generation-context.interface.js';
import { FileWriter } from './file-writer.js';
import { generateResources } from './generate-resoruces.js';
import { generateTypes } from './generate-types.js';

export interface ServiceGenerateConfig {
  serviceUrl: string;
  document: OpraDocument,
  outDir: string,
  cwd?: string;
  logger?: ILogger;
  writer?: IFileWriter;
  fileHeader?: string;
  extension?: string;
}

export async function generateService(
    config: ServiceGenerateConfig
): Promise<void> {
  const cwd = config.cwd || process.cwd();
  const logger = config.logger || console;

  const ctx: ServiceGenerationContext = {
    serviceUrl: config.serviceUrl,
    document: config.document,
    logger,
    cwd,
    relativeDir: config.outDir,
    absoluteDir: path.resolve(cwd, config.outDir),
    fileHeader: config.fileHeader || '',
    extension: config.extension,
    writer: config.writer || new FileWriter()
  };

  fs.mkdirSync(ctx.absoluteDir, {recursive: true});
  await generateTypes(ctx);
  await generateResources(ctx);

}
