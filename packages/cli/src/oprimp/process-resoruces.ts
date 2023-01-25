import chalk from 'chalk';
import path from 'path';
import { CollectionResourceInfo, joinPath, SingletonResourceInfo } from '@opra/common';
import { ServiceGenerationContext } from '../interfaces/service-generation-context.interface.js';
import { wrapJSDocString } from '../utils/string-utils.js';
import { TsFile } from '../utils/ts-file.js';

export async function processResources(ctx: ServiceGenerationContext) {
  const targetDir = ctx.absoluteDir;
  ctx.logger.log(chalk.yellow('Processing resources'));

  const serviceTs = new TsFile();
  serviceTs.header = ctx.fileHeader;
  serviceTs.addImport('@opra/client', 'OpraHttpClient');

  serviceTs.content = `
const kClient = Symbol('client');
  
export class ${ctx.name} {
  static kClient = kClient;
  [kClient]: OpraHttpClient;
  
  constructor(client: OpraHttpClient) {
    this[kClient] = client;
  }
  `;


  const resourceNames = Array.from(ctx.document.resources.keys()).sort();

  for (const resourceName of resourceNames) {
    const resource = ctx.document.getResource(resourceName);
    serviceTs.content += `\n/**\n * ${wrapJSDocString(resource.description || resource.name)}
 * @url ${joinPath(ctx.serviceUrl, '$metadata/resources/' + resource.name)}
 */`;

    if (resource instanceof CollectionResourceInfo) {
      serviceTs.addImport('@opra/client', 'HttpCollectionService');
      serviceTs.addImport('./types/' + resource.dataType.name + ctx.extension, resource.dataType.name);
      const methods = resource.getHandlerNames()
          .filter(x => x !== 'count')
          .map(x => `'${x}'`).join(' | ');
      serviceTs.content += `
  get ${resource.name}(): Pick<HttpCollectionService<${resource.dataType.name}, never>, ${methods}> {
    return this[kClient].collection('${resource.name}');
  }\n`;
    } else if (resource instanceof SingletonResourceInfo) {
      serviceTs.addImport('@opra/client', 'HttpSingletonService');
      serviceTs.addImport('./types/' + resource.dataType.name + ctx.extension, resource.dataType.name);
      const methods = resource.getHandlerNames()
          .map(x => `'${x}'`).join(' | ');
      serviceTs.content += `
  get ${resource.name}(): Pick<HttpSingletonService<${resource.dataType.name}, never>, ${methods}> {
    return this[kClient].singleton('${resource.name}');
  }\n`;
    }
  }

  serviceTs.content += `
}\n`;
  await serviceTs.writeFile(ctx, path.join(targetDir, ctx.name + '.ts'));
}
