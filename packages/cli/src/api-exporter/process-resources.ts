import chalk from 'chalk';
import path from 'node:path';
import { Collection, joinPath, Singleton } from '@opra/common';
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
  this.logger.log(chalk.yellow('Processing resources'));
  const {document} = this;
  const serviceTs = this.addFile(path.join(targetDir, this.serviceClassName + '.ts'));
  serviceTs.addImportPackage('@opra/client', ['HttpServiceBase']);

  const indexTs = this.addFile('/index.d.ts', true);
  indexTs.addExportFile(serviceTs.filename);

  serviceTs.content = `\nexport class ${this.serviceClassName} extends HttpServiceBase {\n`;

  for (const resource of document.resources.values()) {
    serviceTs.content += `\n/**\n * ${wrapJSDocString(resource.description || resource.name)}
 * @url ${joinPath(this.client.serviceUrl, '$metadata#resources/' + resource.name)}
 */`;

    if (resource instanceof Collection) {
      const typeName = resource.type.name || '';
      serviceTs.addImportPackage('@opra/client', ['HttpCollectionNode']);
      serviceTs.addImportFile(`types/${typeName}-type`, [typeName]);

      const operations = Object.keys(resource.operations)
          .map(x => `'${x}'`).join(' | ');
      serviceTs.content += `
  get ${resource.name}(): Pick<HttpCollectionNode<${typeName}>, ${operations}> {
    return this.$client.collection('${resource.name}');
  }\n`;
    } else if (resource instanceof Singleton) {
      const typeName = resource.type.name || '';
      serviceTs.addImportPackage('@opra/client', ['HttpSingletonNode']);
      serviceTs.addImportFile(`types/${typeName}-type`, [typeName]);

      const operations = Object.keys(resource.operations)
          .map(x => `'${x}'`).join(' | ');
      serviceTs.content += `
  get ${resource.name}(): Pick<HttpSingletonNode<${typeName}>, ${operations}> {
    return this.$client.singleton('${resource.name}');
  }\n`;
    }


  }
  serviceTs.content += '}';
}
