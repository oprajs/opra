import path from 'path';
import flattenText from 'putil-flattentext';
import { CodeBlock } from '../code-block.js';

export class TsFile {
  readonly dirname: string;
  imports: Record<string, { items: string[]; typeImport?: boolean }> = {};
  exportFiles: Record<string, string[]> = {};
  exportTypes: string[] = [];
  code = new CodeBlock();

  constructor(readonly filename: string) {
    this.dirname = path.dirname(filename);
    this.code.header = '';
    this.code.imports = '';
    this.code.exports = '';
  }

  addImport(filename: string, items?: string[], typeImport?: boolean) {
    if (isLocalFile(filename)) {
      filename = path.relative(this.dirname, path.resolve(this.dirname, filename));
      if (!filename.startsWith('.')) filename = './' + filename;
    }
    if (filename.endsWith('.d.ts')) filename = filename.substring(0, filename.length - 5);
    if (filename.endsWith('.ts') || filename.endsWith('.js')) filename = filename.substring(0, filename.length - 3);
    const imp = (this.imports[filename] = this.imports[filename] || { items: [], typeImport });
    if (!typeImport) imp.typeImport = false;
    items?.forEach(x => {
      if (!imp.items.includes(x)) imp.items.push(x);
    });
  }

  addExport(filename: string, types?: string[]) {
    if (isLocalFile(filename)) {
      filename = path.relative(this.dirname, path.resolve(this.dirname, filename));
      if (!filename.startsWith('.')) filename = './' + filename;
    }
    if (filename.endsWith('.d.ts')) filename = filename.substring(0, filename.length - 5);
    if (filename.endsWith('.ts') || filename.endsWith('.js')) filename = filename.substring(0, filename.length - 3);
    this.exportFiles[filename] = this.exportFiles[filename] || [];
    types?.forEach(x => {
      if (!this.exportFiles[filename].includes(x)) this.exportFiles[filename].push(x);
    });
  }

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
      .map(filename => {
        const types = this.exportFiles[filename];
        if (!isPackageName(filename)) {
          if (options?.importExt) filename += '.js';
        }
        return `export ${types.length ? '{ ' + types.join(', ') + ' }' : '*'} from '${filename}';`;
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

const PACKAGENAME_PATTERN = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

function isPackageName(s: string): boolean {
  return PACKAGENAME_PATTERN.test(s);
}
