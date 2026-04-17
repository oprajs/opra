import fs from 'node:fs';
import type { IFileWriter } from './interfaces/file-writer.interface.js';

/**
 * FileWriter
 *
 * Implementation of IFileWriter that uses node:fs to write files.
 */
export class FileWriter implements IFileWriter {
  /**
   * Writes contents to a file.
   *
   * @param filename - The path to the file to write.
   * @param contents - The string content to write to the file.
   */
  writeFile(filename: string, contents: string): void {
    fs.writeFileSync(filename, contents, 'utf-8');
  }
}
