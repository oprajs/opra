import path from 'node:path';
import flattenText from 'putil-flattentext';
import { CodeBlock } from '../code-block.js';

/**
 * TsFile
 *
 * A class representing a TypeScript source file, managing its imports, exports, and content.
 */
export class TsFile {
  /** The directory name of the file. */
  readonly dirname: string;
  /** Map of imports where key is the module path. */
  imports: Record<string, { items: string[]; typeImport?: boolean }> = {};
  /** Map of exports where key is the module path. */
  exportFiles: Record<
    string,
    { filename: string; items: string[]; namespace?: string }
  > = {};
  /** List of types to be exported. */
  exportTypes: string[] = [];
  /** The code block representing the file's content. */
  code = new CodeBlock();

  /**
   * Initializes a new TsFile instance.
   *
   * @param filename - The name of the file.
   */
  constructor(readonly filename: string) {
    this.dirname = path.dirname(filename);
    this.code.header = '';
    this.code.imports = '';
    this.code.exports = '';
  }

  /**
   * Adds an import statement to the file.
   *
   * @param filename - The module to import from.
   * @param items - The specific items to import.
   * @param typeImport - Whether it is a type-only import.
   */
  addImport(filename: string, items?: string[], typeImport?: boolean) {
    if (isLocalFile(filename)) {
      filename = path.relative(
        this.dirname,
        path.resolve(this.dirname, filename),
      );
      if (!filename.startsWith('.')) filename = './' + filename;
    }
    if (filename.endsWith('.d.ts'))
      filename = filename.substring(0, filename.length - 5);
    if (filename.endsWith('.ts') || filename.endsWith('.js'))
      filename = filename.substring(0, filename.length - 3);
    const imp = (this.imports[filename] = this.imports[filename] || {
      items: [],
      typeImport,
    });
    if (!typeImport) imp.typeImport = false;
    items?.forEach(x => {
      if (!imp.items.includes(x)) imp.items.push(x);
    });
  }

  /**
   * Adds an export statement to the file.
   *
   * @param filename - The module to export from.
   * @param types - The specific items to export.
   * @param namespace - The namespace to export as.
   */
  addExport(filename: string, types?: string[], namespace?: string) {
    if (isLocalFile(filename)) {
      filename = path.relative(
        this.dirname,
        path.resolve(this.dirname, filename),
      );
      if (!filename.startsWith('.')) filename = './' + filename;
    }
    if (filename.endsWith('.d.ts'))
      filename = filename.substring(0, filename.length - 5);
    if (filename.endsWith('.ts') || filename.endsWith('.js'))
      filename = filename.substring(0, filename.length - 3);
    const key = (namespace ? namespace + ':' : '') + filename;
    this.exportFiles[key] = this.exportFiles[key] || {
      filename,
      items: [],
      namespace,
    };
    types?.forEach(x => {
      if (!this.exportFiles[filename].items.includes(x))
        this.exportFiles[filename].items.push(x);
    });
  }

  /**
   * Generates the file content as a string.
   *
   * @param options - Generation options.
   * @returns The generated TypeScript code.
   */
  generate(options?: { importExt?: boolean }): string {
    this.code.imports = Object.keys(this.imports)
      .sort((a, b) => {
        if (a.startsWith('@')) return -1;
        if (b.startsWith('@')) return 1;
        if (!a.startsWith('.')) return -1;
        if (!b.startsWith('.')) return 1;
        return a.toLowerCase().localeCompare(b.toLowerCase());
      })
      .map(filename => {
        const imp = this.imports[filename];
        let relFile = filename;
        if (!isPackageName(filename)) {
          if (options?.importExt) relFile += '.js';
        }
        return `import${imp.typeImport ? ' type' : ''} ${imp.items.length ? '{ ' + imp.items.join(', ') + ' } from ' : ''}'${relFile}';`;
      })
      .join('\n');

    this.code.exports = Object.keys(this.exportFiles)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .map(key => {
        const exportFile = this.exportFiles[key];
        const types = exportFile.items;
        let filename = exportFile.filename;
        if (!isPackageName(filename)) {
          if (options?.importExt) filename += '.js';
        }
        let out = `export ${types.length ? '{ ' + types.join(', ') + ' }' : '*'}`;
        if (exportFile.namespace) out += ` as ${exportFile.namespace}`;
        return out + ` from '${filename}';`;
      })
      .join('\n');
    if (this.code.imports || this.code.exports) this.code.exports += '\n\n';

    return (
      '/* #!oprimp_auto_generated!# !! Do NOT remove this line */\n/* eslint-disable */\n// noinspection SpellCheckingInspection\n\n' +
      flattenText(String(this.code))
    );
  }
}

function isLocalFile(s: string): boolean {
  return typeof s === 'string' && (s.startsWith('.') || s.startsWith('/'));
}

const PACKAGENAME_PATTERN =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

function isPackageName(s: string): boolean {
  return PACKAGENAME_PATTERN.test(s);
}
