import * as fs from 'fs';
import path from 'path';
import * as process from 'process';
import { OpraDocument } from '@opra/common';
import { IFileWriter } from '../interfaces/file-writer.interface.js';
import { ILogger } from '../interfaces/logger.interface.js';
import { ServiceGenerationContext } from '../interfaces/service-generation-context.interface.js';
import { TsFile } from '../utils/ts-file.js';
import { FileWriter } from './file-writer.js';
import { generateTypes } from './generate-types.js';

const builtinsMap = {
  base64Binary: 'Buffer',
  dateString: 'string',
  guid: 'string',
  integer: 'number'
}

export interface ServiceGenerateConfig {
  serviceUrl: string;
  document: OpraDocument,
  outDir: string,
  cwd?: string;
  logger?: ILogger;
  writer?: IFileWriter;
  fileHeader?: string;
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
    writer: config.writer || new FileWriter(),
    indexTs: new TsFile(),
    builtins: {},
  };

  fs.mkdirSync(ctx.absoluteDir, {recursive: true});
  await generateTypes(ctx);

  const builtinsTs = new TsFile();
  builtinsTs.header = ctx.fileHeader;

  builtinsTs.content = Object.keys(ctx.builtins)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .map(s => `export type ${s} = ${builtinsMap[s] || 'any'};`)
      .join('\n');
  if (builtinsTs.content) {
    await builtinsTs.writeFile(ctx, path.join(ctx.absoluteDir, 'builtins.ts'));
    ctx.indexTs.addExport('./builtins.js');
  }

  await ctx.indexTs.writeFile(ctx, path.join(ctx.absoluteDir, 'index.ts'));
}
