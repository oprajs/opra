import path from 'path';
import flattenText from 'putil-flattentext';

export class TsFile {
  readonly dirname: string;
  imports: Record<string, { items: string[]; typeImport?: boolean }> = {};
  exportFiles: Record<string, string[]> = {};
  exportTypes: string[] = [];
  header: string = '';
  content: string = '';

  constructor(readonly filename: string) {
    this.dirname = path.dirname(filename);
  }

  addImport = (filename: string, items?: string[], typeImport?: boolean) => {
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
  };

  addExport = (filename: string, types?: string[]) => {
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
  };

  generate(options?: { importExt?: boolean }): string {
    let output =
      '/* #!oprimp_auto_generated!# !! Do NOT remove this line */\n' +
      (this.header ? flattenText(this.header) + '\n\n' : '\n');

    const importStr = Object.keys(this.imports)
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
    if (importStr) output += flattenText(importStr) + '\n';

    output += flattenText(this.content);

    const exportStr = Object.keys(this.exportFiles)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .map(filename => {
        const types = this.exportFiles[filename];
        let relFile = filename;
        if (!isPackageName(filename)) {
          if (options?.importExt) relFile += '.js';
        }
        return `export ${types.length ? '{ ' + types.join(', ') + ' }' : '*'} from '${relFile}';`;
      })
      .join('\n');
    if (exportStr) output += flattenText(exportStr) + '\n';
    return output;
  }
}

function isLocalFile(s: string): boolean {
  return typeof s === 'string' && (s.startsWith('.') || s.startsWith('/'));
}

const PACKAGENAME_PATTERN = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

function isPackageName(s: string): boolean {
  return PACKAGENAME_PATTERN.test(s);
}
