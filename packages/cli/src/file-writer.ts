import fs from 'node:fs';
import type { IFileWriter } from './interfaces/file-writer.interface.js';

export class FileWriter implements IFileWriter {
  writeFile(filename: string, contents: string): void {
    fs.writeFileSync(filename, contents, 'utf-8');
  }
}
