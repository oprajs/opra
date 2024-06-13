import path from 'node:path';
import { ApiResource, Collection, Container, CrudResource, Singleton, Storage } from '@opra/common';
import { wrapJSDocString } from '../utils/string-utils.js';
import type { ApiExporter } from './api-exporter.js';
import { TsFile } from './ts-file.js';

export async function processResource(this: ApiExporter, resource: ApiResource, className: string, tsFile: TsFile) {
  tsFile.addImport('@opra/client', ['kClient', 'OpraHttpClient']);

  tsFile.content = `\n
/** 
 * ${wrapJSDocString(resource.description || '')}
 * @class ${className}
 * @url ${path.posix.join(this.client.serviceUrl, '#resources/' + className)}
 */  
export class ${className} {
  readonly [kClient]: OpraHttpClient;\n`;

  let constructorBody = `
  constructor(client: OpraHttpClient) {
    this[kClient] = client;\n`;

  /** Container */
  if (resource instanceof Container) {
    for (const child of resource.resources.values()) {
      // Determine class name of child resource
      let childClassName = child.name.charAt(0).toUpperCase() + child.name.substring(1);
      if (child instanceof Container) childClassName += 'Container';
      else childClassName += 'Resource';

      // Create TsFile for child resource
      const dir = path.dirname(tsFile.filename);
      const basename = dir === '/' ? 'root' : path.basename(tsFile.filename, path.extname(tsFile.filename));
      const childFile = this.addFile(path.join(dir, basename, child.name + '.ts'));
      await this.processResource(child, childClassName, childFile);
      tsFile.addImport(childFile.filename, [childClassName]);

      tsFile.content += `
  /**
   * ${wrapJSDocString(child.description || '')}    
   * @url ${path.posix.join(this.client.serviceUrl, '#resources/' + child.name)}
   */      
  readonly ${child.name}: ${childClassName};\n`;
      constructorBody += `    this.${child.name} = new ${childClassName}(client);\n`;
    }
  } else if (resource instanceof CrudResource) {
    /** Collection, Singleton, Storage */
    let typeName = '';
    if (resource instanceof Collection) {
      tsFile.addImport('@opra/client', ['HttpCollectionNode']);
      typeName = resource.type.name || '';
      tsFile.addImport(`/types/${typeName}`, [typeName], true);
      constructorBody += `    const node = this[kClient].collection('${resource.getFullPath()}');\n`;
    } else if (resource instanceof Singleton) {
      tsFile.addImport('@opra/client', ['HttpSingletonNode']);
      typeName = resource.type.name || '';
      tsFile.addImport(`/types/${typeName}`, [typeName], true);
      constructorBody += `    const node = this[kClient].singleton('${resource.getFullPath()}');\n`;
    } else {
      tsFile.addImport('@opra/client', ['HttpStorageNode']);
      constructorBody += `    const node = this[kClient].storage('${resource.getFullPath()}');\n`;
    }

    for (const [operation, endpoint] of resource.operations.entries()) {
      tsFile.content += `
  /** 
   * ${wrapJSDocString(endpoint.description || '')}`;
      for (const prm of endpoint.parameters) {
        tsFile.content +=
          `\n   * @query {${prm.type.name || 'any'}} ${String(prm.name)}` +
          (prm.description ? ' - ' + prm.description : '') +
          (prm.required ? ' (required)' : '') +
          (prm.deprecated ? ' (deprecated)' : '');
      }
      for (const prm of endpoint.headers) {
        tsFile.content +=
          `\n   * @header {${prm.type.name || 'any'}} ${String(prm.name)}` +
          (prm.description ? ' - ' + prm.description : '') +
          (prm.required ? ' (required)' : '') +
          (prm.deprecated ? ' (deprecated)' : '');
      }
      tsFile.content += `\n   */`;

      if (resource instanceof Collection) {
        tsFile.content += `  readonly ${operation}: HttpCollectionNode<${typeName}>['${operation}'];\n`;
      } else if (resource instanceof Singleton) {
        tsFile.content += `  readonly ${operation}: HttpSingletonNode<${typeName}>['${operation}'];\n`;
      } else if (resource instanceof Storage) {
        if (operation === 'post' && endpoint.response.type) {
          typeName = endpoint.response.type.name || 'any'; // todo
          tsFile.addImport(`/types/${typeName}`, [typeName], true);
          tsFile.content += `\n  readonly ${operation}: HttpStorageNode<${typeName}>['${operation}'];\n`;
        } else tsFile.content += `\n  readonly ${operation}: HttpStorageNode['${operation}'];\n`;
      }
    }
  }

  if (resource.actions.size) {
    tsFile.addImport('@opra/client', ['HttpRequestObservable']);
    for (const [action, endpoint] of resource.actions.entries()) {
      let returnTypeDef = endpoint.response.type
        ? await this.resolveTypeNameOrDef({
            file: tsFile,
            dataType: endpoint.response.type,
            intent: 'field',
          })
        : 'any';
      if (returnTypeDef.length > 40) returnTypeDef = '\n\t\t' + returnTypeDef + '\n\b\b';

      const actionPath = resource.getFullPath() + '/' + action;
      let params = '';
      for (const prm of endpoint.parameters.values()) {
        const paramTypeDef =
          (await this.resolveTypeNameOrDef({
            file: tsFile,
            dataType: prm.type,
            intent: 'field',
          })) || 'any';
        params += `${prm.name}: ${paramTypeDef}`;
        if (prm.isArray) params += '[]';
        params += ';\n';
      }
      params = params ? '\n\t\t\tparams: {\n\t' + params + '\b}\n\b\b' : '';

      tsFile.content += `
  /** 
   * ${wrapJSDocString(endpoint.description || '')}
   */      
  ${action}(${params}): HttpRequestObservable<${returnTypeDef}> {\b  
    return this[kClient].action('${actionPath}'${params ? ', params' : ''});
  }    
`;
    }
  }

  tsFile.content += constructorBody + `  }\n\n}\n`;
  return tsFile.content;
}
