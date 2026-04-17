/**
 * IFileWriter
 *
 * Interface for file writing operations.
 */
export interface IFileWriter {
  /**
   * Writes contents to a file.
   *
   * @param filename - The path to the file to write.
   * @param contents - The string content to write to the file.
   * @returns A promise that resolves when the file is written, or void if synchronous.
   */
  writeFile(filename: string, contents: string): Promise<void> | void;
}
