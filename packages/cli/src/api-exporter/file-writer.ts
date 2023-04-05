import fs from 'fs';
import { IFileWriter } from '../interfaces/file-writer.interface.js';

export class FileWriter implements IFileWriter {
  writeFile(filename: string, contents: string): void {
    fs.writeFileSync(filename, contents, 'utf-8');
  }
}
