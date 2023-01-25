import chalk from 'chalk';
import path from 'path';
import flattenText from 'putil-flattentext';
import { ServiceGenerationContext } from '../interfaces/service-generation-context.interface.js';

export class TsFile {
  imports: Record<string, string[]> = {};
  exports: Record<string, string[]> = {};
  header: string = '';
  content: string = '';

  addImport = (filename: string, imported: string) => {
    this.imports[filename] = this.imports[filename] || [];
    if (!this.imports[filename].includes(imported))
      this.imports[filename].push(imported);
  }

  addExport = (filename: string, exported?: string) => {
    this.exports[filename] = this.exports[filename] || [];
    if (exported && !this.exports[filename].includes(exported))
      this.exports[filename].push(exported);
  }

  generate(): string {
    let output = '/* #!oprimp_auto_generated!# !! Do NOT remove this line */\n' +
        (this.header ? flattenText(this.header) + '\n\n' : '\n');

    const importStr = Object.keys(this.imports)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map(i => `import { ${this.imports[i].join(', ')} } from '${i}';`)
        .join('\n');
    if (importStr)
      output += flattenText(importStr) + '\n';

    output += flattenText(this.content);

    const exportStr = Object.keys(this.exports)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map(i => {
          const a = this.exports[i];
          return `export ${a.length ? '{' + a.join(', ') + '}' : '*'} from '${i}';`;
        })
        .join('\n');
    if (exportStr)
      output += flattenText(exportStr) + '\n';
    return output;
  }

  async writeFile(ctx: ServiceGenerationContext, filename: string) {
    await ctx.writer.writeFile(filename, this.generate());
    ctx.logger.log(' - Written', chalk.whiteBright('./' + path.relative(ctx.absoluteDir, filename)));
  }

}
