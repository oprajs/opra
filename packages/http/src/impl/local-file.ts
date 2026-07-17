import fs from 'node:fs';
import fsAsync from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { uid } from 'uid';

// Exit-based cleanup: `process.finalization` is an experimental Node API that
// prints a runtime warning, so pending deletions are tracked and flushed
// synchronously on the 'exit' event instead.
const pendingDeletes = new Set<string>();
let exitHandlerRegistered = false;

function ensureExitHandler() {
  if (exitHandlerRegistered) return;
  exitHandlerRegistered = true;
  process.on('exit', () => {
    for (const storedPath of pendingDeletes) {
      try {
        fs.unlinkSync(storedPath);
      } catch {
        /* ignore */
      }
    }
  });
}

const registry = new FinalizationRegistry((storedPath: string) => {
  pendingDeletes.delete(storedPath);
  fs.unlink(storedPath, () => undefined);
});

/**
 * LocalFile represents a file stored on the local file system.
 * It provides utility methods for reading the file content and managing its lifecycle.
 */
export class LocalFile {
  private _autoDelete: boolean = false;
  readonly storedPath: string;
  filename: string;
  type?: string;
  encoding?: BufferEncoding;

  constructor(storedPath: string, options: LocalFile.Options = {}) {
    this.storedPath = storedPath;
    this.filename = options.filename ?? path.basename(storedPath);
    this.type = options.type;
    if (options?.autoDelete) this.autoDelete = true;
  }

  async text(): Promise<string> {
    return fsAsync.readFile(this.storedPath, this.encoding || 'utf-8');
  }

  async buffer(): Promise<Buffer> {
    return fsAsync.readFile(this.storedPath);
  }

  /**
   * Deletes the local file.
   *
   * @returns A promise that resolves when the file is deleted.
   */
  async delete(): Promise<void> {
    if (fs.existsSync(this.storedPath)) {
      try {
        await fsAsync.unlink(this.storedPath);
        this.autoDelete = false;
      } catch (error) {
        console.error(`Failed to delete file ${this.storedPath}: ${error}`);
      }
    }
  }

  get size(): number {
    return fs.statSync(this.storedPath).size;
  }

  get autoDelete(): boolean {
    return this._autoDelete;
  }

  set autoDelete(value: boolean) {
    if (value === this._autoDelete) return;
    this._autoDelete = value;
    if (value) {
      registry.register(this, this.storedPath, this); // GC-based
      ensureExitHandler();
      pendingDeletes.add(this.storedPath); // exit-based
    } else {
      registry.unregister(this);
      pendingDeletes.delete(this.storedPath);
    }
  }

  static tempFilename(filename?: string, tempDirectory?: string) {
    let filePath: string;
    let prefix = '';
    tempDirectory = tempDirectory || os.tmpdir();
    while (true) {
      filePath = path.posix.join(
        tempDirectory,
        filename ? prefix + filename : 'opra-' + uid(12),
      );
      if (!fs.existsSync(filePath)) return filePath;
      prefix = uid(6) + '-';
    }
  }
}

export namespace LocalFile {
  export interface Options {
    filename?: string;
    autoDelete?: boolean;
    type?: string;
    encoding?: BufferEncoding;
  }
}
