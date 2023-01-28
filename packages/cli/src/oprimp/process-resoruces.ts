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
  serviceTs.addImport('@opra/client', 'HttpServiceBase');

  serviceTs.content = `  
export class ${ctx.name} extends HttpServiceBase {\n`;

  const resourceNames = Array.from(ctx.document.resources.keys()).sort();

  for (const resourceName of resourceNames) {
    const resource = ctx.document.getResource(resourceName);
    serviceTs.content += `\n/**\n * ${wrapJSDocString(resource.description || resource.name)}
 * @url ${joinPath(ctx.serviceUrl, '$metadata/resources/' + resource.name)}
 */`;

    if (resource instanceof CollectionResourceInfo) {
      serviceTs.addImport('@opra/client', 'HttpCollectionNode');
      serviceTs.addImport('./types/' + resource.dataType.name + ctx.extension, resource.dataType.name);
      const methods = resource.getHandlerNames()
          .filter(x => x !== 'count')
          .map(x => `'${x}'`).join(' | ');
      serviceTs.content += `
  get ${resource.name}(): Pick<HttpCollectionNode<${resource.dataType.name}>, ${methods}> {
    return this.$client.collection('${resource.name}');
  }\n`;
    } else if (resource instanceof SingletonResourceInfo) {
      serviceTs.addImport('@opra/client', 'HttpSingletonNode');
      serviceTs.addImport('./types/' + resource.dataType.name + ctx.extension, resource.dataType.name);
      const methods = resource.getHandlerNames()
          .map(x => `'${x}'`).join(' | ');
      serviceTs.content += `
  get ${resource.name}(): Pick<HttpSingletonNode<${resource.dataType.name}>, ${methods}> {
    return this.$client.singleton('${resource.name}');
  }\n`;
    }
  }

  serviceTs.content += `
}\n`;
  await serviceTs.writeFile(ctx, path.join(targetDir, ctx.name + '.ts'));
}
