import { OpraDocument } from '@opra/common';
import { IFileWriter } from './file-writer.interface.js';
import { ILogger } from './logger.interface.js';

export interface ServiceGenerationContext {
  serviceUrl: string;
  document: OpraDocument;
  name: string;
  cwd: string;
  logger: ILogger;
  relativeDir: string;
  absoluteDir: string;
  fileHeader: string;
  extension?: string;
  writer: IFileWriter;
}
