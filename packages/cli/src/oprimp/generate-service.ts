import chalk from 'chalk';
import console from 'console';
import * as fs from 'fs';
import path from 'path';
import * as process from 'process';
import { OpraHttpClient } from '@opra/node-client';
import { IFileWriter } from '../interfaces/file-writer.interface.js';
import { ILogger } from '../interfaces/logger.interface.js';
import type { ServiceGenerationContext } from '../interfaces/service-generation-context.interface.js';
import { TsFile } from '../utils/ts-file.js';
import { deleteFiles } from './delete-files.js';
import { FileWriter } from './file-writer.js';
import { processResources } from './process-resoruces.js';
import { processTypes } from './process-types.js';

export interface ServiceGenerateConfig {
  serviceUrl: string;
  outDir: string,
  name?: string;
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

  console.log(chalk.yellow('Fetching service metadata from'), chalk.whiteBright(config.serviceUrl));
  const client = await OpraHttpClient.create(config.serviceUrl);
  const metadata = client.metadata;
  console.log(chalk.yellow('Retrieved service info:'),
      chalk.whiteBright(metadata.info.title), '-',
      chalk.whiteBright(metadata.info.version));
  console.log(chalk.yellow('Removing old files..'));
  deleteFiles(config.outDir);

  let name = (metadata.info.title || 'Service1').replace(/[^\w_$]*/g, '')
  name = name.charAt(0).toUpperCase() + name.substring(1);

  const ctx: ServiceGenerationContext = {
    serviceUrl: config.serviceUrl,
    document: client.metadata,
    name,
    logger,
    cwd,
    relativeDir: config.outDir,
    absoluteDir: path.resolve(cwd, config.outDir),
    fileHeader: config.fileHeader || '',
    extension: config.extension,
    writer: config.writer || new FileWriter()
  };

  fs.mkdirSync(ctx.absoluteDir, {recursive: true});
  await processTypes(ctx);
  await processResources(ctx);

  const indexTs = new TsFile();
  indexTs.header = ctx.fileHeader;
  indexTs.addExport('./' + ctx.name + ctx.extension);
  indexTs.addExport('./types' + ctx.extension);
  await indexTs.writeFile(ctx, path.join(ctx.absoluteDir, 'index.ts'));
}
