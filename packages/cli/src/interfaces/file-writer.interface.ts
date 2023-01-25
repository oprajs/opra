export interface IFileWriter {
  writeFile(filename: string, contents: string): Promise<void> | void;
}
