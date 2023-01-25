import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { CollectionResourceInfo, joinPath, SingletonResourceInfo } from '@opra/common';
import { ServiceGenerationContext } from '../interfaces/service-generation-context.interface.js';
import { wrapJSDocString } from '../utils/string-utils.js';
import { TsFile } from '../utils/ts-file.js';

export async function generateResources(ctx: ServiceGenerationContext) {
  const targetDir = path.join(ctx.absoluteDir, 'resources');
  ctx.logger.log(chalk.yellow('Generating resources'));

  const resourcesTs = new TsFile();
  resourcesTs.header = ctx.fileHeader;
  let i = 0;

  fs.mkdirSync(targetDir, {recursive: true});
  const resourceNames = Array.from(ctx.document.resources.keys()).sort();

  for (const resourceName of resourceNames) {
    const resource = ctx.document.getResource(resourceName);

    const tsFile = new TsFile();
    tsFile.header = ctx.fileHeader;
    tsFile.content = `\n/**\n * ${wrapJSDocString(resource.description || resource.name)}
 * @type ${resource.name}
 * @kind ${resource.kind}
 * @url ${joinPath(ctx.serviceUrl, '$metadata/resources/' + resource.name)}
 */\n`;

    const filename = `./resources/${resource.name}`;

    if (resource instanceof CollectionResourceInfo) {
      await generateCollectionResource(ctx, resource, tsFile);
      await tsFile.writeFile(ctx, path.join(targetDir, resource.name + '.ts'));
      resourcesTs.addExport(`${filename}` + ctx.extension);
      i++;
    } else if (resource instanceof SingletonResourceInfo) {
      await generateSingletonResource(ctx, resource, tsFile);
      await tsFile.writeFile(ctx, path.join(targetDir, resource.name + '.ts'));
      resourcesTs.addExport(`${filename}${ctx.extension}`);
      i++;
    }
  }
  if (i) {
    await resourcesTs.writeFile(ctx, path.join(ctx.absoluteDir, 'resources.ts'));
  }
}

async function generateCollectionResource(
    ctx: ServiceGenerationContext,
    resource: CollectionResourceInfo,
    tsFile: TsFile
) {
  tsFile.header = ctx.fileHeader;
  tsFile.addImport('@opra/client', 'OpraHttpClient', 'HttpCollectionService');
  tsFile.addImport('../types/' + resource.dataType.name + ctx.extension, resource.dataType.name);

  const methods = resource.getHandlerNames()
      .filter(x => x !== 'count')
      .map(x => `'${x}'`).join(' | ');

  tsFile.content = `
export function ${resource.name}(
    client: OpraHttpClient
): Pick<HttpCollectionService<${resource.dataType.name}, never>, ${methods}> {
  return client.collection('${resource.name}');
}
`;
}

async function generateSingletonResource(
    ctx: ServiceGenerationContext,
    resource: SingletonResourceInfo,
    tsFile: TsFile
) {
  tsFile.header = ctx.fileHeader;
  tsFile.addImport('@opra/client', 'OpraHttpClient', 'HttpSingletonService');
  tsFile.addImport('../types/' + resource.dataType.name + ctx.extension, resource.dataType.name);

  const methods = resource.getHandlerNames().map(x => `'${x}'`).join(' | ');

  tsFile.content = `
export function ${resource.name}(client: OpraHttpClient): Pick<HttpSingletonService<${resource.dataType.name}, never>, ${methods}> {
  return client.singleton('${resource.name}');
}
`;

}
