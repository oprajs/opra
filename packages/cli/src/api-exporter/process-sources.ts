import chalk from 'chalk';
import path from 'node:path';
import { Collection, Singleton } from '@opra/common';
import { wrapJSDocString } from '../utils/string-utils.js';
import type { ApiExporter } from './api-exporter.js';

/**
 *
 * @param targetDir
 */
export async function processSources(
    this: ApiExporter,
    targetDir: string = ''
) {
  this.logger.log(chalk.cyan('Processing sources'));
  const {document} = this;
  const serviceTs = this.addFile(path.join(targetDir, this.serviceClassName + '.ts'));
  serviceTs.addImportPackage('@opra/client', ['HttpServiceBase']);

  const indexTs = this.addFile('/index.ts', true);
  indexTs.addExportFile(serviceTs.filename);

  serviceTs.content = `\nexport class ${this.serviceClassName} extends HttpServiceBase {\n`;

  for (const source of document.sources.values()) {
    const jsDoc = `
  /**
   * ${wrapJSDocString(source.description || source.name)}    
   * @url ${path.posix.join(this.client.serviceUrl, '#sources/' + source.name)}
   */`;

    if (source instanceof Collection) {
      const typeName = source.type.name || '';
      serviceTs.addImportPackage('@opra/client', ['HttpCollectionNode']);
      serviceTs.addImportFile(`types/${typeName}-type`, [typeName]);

      const operations = Object.keys(source.operations)
          .map(x => `'${x}'`).join(' | ');
      if (!operations.length) {
        this.logger.warn(chalk.yellow('WARN: ') +
            `Ignoring "${chalk.whiteBright(source.name)}" source. No operations available.`);
        continue;
      }

      serviceTs.content += jsDoc + `
  get ${source.name}(): Pick<HttpCollectionNode<${typeName}>, ${operations}> {
    return this.$client.collection('${source.name}');
  }\n`;
    } else if (source instanceof Singleton) {
      const typeName = source.type.name || '';
      serviceTs.addImportPackage('@opra/client', ['HttpSingletonNode']);
      serviceTs.addImportFile(`types/${typeName}-type`, [typeName]);

      const operations = Object.keys(source.operations)
          .map(x => `'${x}'`).join(' | ');
      if (!operations.length) {
        this.logger.warn(chalk.yellow('WARN: ') +
            `Ignoring "${chalk.whiteBright(source.name)}" source. No operations available.`);
        continue;
      }

      serviceTs.content += jsDoc + `
  get ${source.name}(): Pick<HttpSingletonNode<${typeName}>, ${operations}> {
    return this.$client.singleton('${source.name}');
  }\n`;
    }


  }
  serviceTs.content += '}';
}
