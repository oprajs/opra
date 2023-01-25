import { OpraDocument } from '@opra/common';
import { TsFile } from '../utils/ts-file.js';
import { IFileWriter } from './file-writer.interface.js';
import { ILogger } from './logger.interface.js';

export interface ServiceGenerationContext {
  serviceUrl: string;
  document: OpraDocument;
  cwd: string;
  logger: ILogger;
  relativeDir: string;
  absoluteDir: string;
  fileHeader: string;
  writer: IFileWriter;
  indexTs: TsFile;
  builtins: any;
}
