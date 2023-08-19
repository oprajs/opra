import chalk from 'chalk';
import path from 'node:path';
import { Collection, Singleton } from '@opra/common';
import { wrapJSDocString } from '../utils/string-utils.js';
import type { ApiExporter } from './api-exporter.js';

/**
 *
 * @param targetDir
 */
export async function processResources(
    this: ApiExporter,
    targetDir: string = ''
) {
  this.logger.log(chalk.cyan('Processing resources'));
  const {document} = this;
  const serviceTs = this.addFile(path.join(targetDir, this.serviceClassName + '.ts'));
  serviceTs.addImportPackage('@opra/client', ['HttpServiceBase']);

  const indexTs = this.addFile('/index.ts', true);
  indexTs.addExportFile(serviceTs.filename);

  serviceTs.content = `\nexport class ${this.serviceClassName} extends HttpServiceBase {\n`;

  for (const resource of document.sources.values()) {
    const jsDoc = `
  /**
   * ${wrapJSDocString(resource.description || resource.name)}    
   * @url ${path.posix.join(this.client.serviceUrl, '$metadata#resources/' + resource.name)}
   */`;

    if (resource instanceof Collection) {
      const typeName = resource.type.name || '';
      serviceTs.addImportPackage('@opra/client', ['HttpCollectionNode']);
      serviceTs.addImportFile(`types/${typeName}-type`, [typeName]);

      const operations = Object.keys(resource.endpoints)
          .map(x => `'${x}'`).join(' | ');
      if (!operations.length) {
        this.logger.warn(chalk.yellow('WARN: ') +
            `Ignoring "${chalk.whiteBright(resource.name)}" resource. No operations available.`);
        continue;
      }

      serviceTs.content += jsDoc + `
  get ${resource.name}(): Pick<HttpCollectionNode<${typeName}>, ${operations}> {
    return this.$client.collection('${resource.name}');
  }\n`;
    } else if (resource instanceof Singleton) {
      const typeName = resource.type.name || '';
      serviceTs.addImportPackage('@opra/client', ['HttpSingletonNode']);
      serviceTs.addImportFile(`types/${typeName}-type`, [typeName]);

      const operations = Object.keys(resource.endpoints)
          .map(x => `'${x}'`).join(' | ');
      if (!operations.length) {
        this.logger.warn(chalk.yellow('WARN: ') +
            `Ignoring "${chalk.whiteBright(resource.name)}" resource. No operations available.`);
        continue;
      }

      serviceTs.content += jsDoc + `
  get ${resource.name}(): Pick<HttpSingletonNode<${typeName}>, ${operations}> {
    return this.$client.singleton('${resource.name}');
  }\n`;
    }


  }
  serviceTs.content += '}';
}
