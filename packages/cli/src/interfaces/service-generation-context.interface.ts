import { ApiDocument } from '@opra/common';
import type { IFileWriter } from './file-writer.interface.js';
import type { ILogger } from './logger.interface.js';

export interface ServiceGenerationContext {
  serviceUrl: string;
  document: ApiDocument;
  name: string;
  cwd: string;
  logger: ILogger;
  relativeDir: string;
  absoluteDir: string;
  fileHeader: string;
  extension?: string;
  writer: IFileWriter;
}
