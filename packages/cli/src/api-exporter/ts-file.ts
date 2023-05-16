import path from 'path';
import flattenText from 'putil-flattentext';

export class TsFile {
  dirname: string;
  importFiles: Record<string, string[]> = {};
  exportFiles: Record<string, string[]> = {};
  exportTypes: string[] = [];
  header: string = '';
  content: string = '';

  constructor(public filename: string) {
    this.dirname = path.dirname(filename);
  }

  addImportPackage = (name: string, types?: string[]) => {
    this.importFiles[name] = this.importFiles[name] || [];
    types?.forEach(x => {
      if (!this.importFiles[name].includes(x))
        this.importFiles[name].push(x);
    });
  }

  addImportFile = (filename: string, types?: string[]) => {
    filename = path.resolve(this.dirname, filename);
    if (filename.endsWith('.d.ts'))
      filename = filename.substring(0, filename.length - 5);
    if (filename.endsWith('.ts'))
      filename = filename.substring(0, filename.length - 3);
    this.importFiles[filename] = this.importFiles[filename] || [];
    types?.forEach(x => {
      if (!this.importFiles[filename].includes(x))
        this.importFiles[filename].push(x);
    });
  }

  addExportFile = (filename: string, types?: string[]) => {
    filename = path.resolve(this.dirname, filename);
    if (filename.endsWith('.d.ts'))
      filename = filename.substring(0, filename.length - 5);
    if (filename.endsWith('.ts'))
      filename = filename.substring(0, filename.length - 3);
    this.exportFiles[filename] = this.exportFiles[filename] || [];
    types?.forEach(x => {
      if (!this.exportFiles[filename].includes(x))
        this.exportFiles[filename].push(x);
    });
  }

  generate(options?: { importExt?: boolean }): string {
    const dirname = path.dirname(this.filename);
    let output = '/* #!oprimp_auto_generated!# !! Do NOT remove this line */\n' +
        (this.header ? flattenText(this.header) + '\n\n' : '\n');

    const importStr = Object.keys(this.importFiles)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map(filename => {
          const types = this.importFiles[filename];
          let relFile = filename;
          if (path.isAbsolute(filename)) {
            relFile = relativePath(dirname, filename);
            if (options?.importExt)
              relFile += '.js';
          }
          return `import ${types.length ? '{ ' + types.join(', ') + ' } from ' : ''}'${relFile}';`;
        })
        .join('\n');
    if (importStr)
      output += flattenText(importStr) + '\n';

    output += flattenText(this.content);

    const exportStr = Object.keys(this.exportFiles)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map(filename => {
          const types = this.exportFiles[filename];
          let relFile = filename;
          if (path.isAbsolute(filename)) {
            relFile = relativePath(dirname, filename);
            if (options?.importExt)
              relFile += '.js';
          }
          return `export ${types.length ? '{ ' + types.join(', ') + ' }' : '*'} from '${relFile}';`;
        })
        .join('\n');
    if (exportStr)
      output += flattenText(exportStr) + '\n';
    return output;
  }

}

export function relativePath(from: string, to: string): string {
  const s = path.relative(from, to);
  return s.startsWith('.') ? s : ('./' + s);
}
