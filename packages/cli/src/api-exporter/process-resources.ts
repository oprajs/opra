import path from 'node:path';
import { Collection, Container, Resource, Singleton } from '@opra/common';
import { wrapJSDocString } from '../utils/string-utils.js';
import type { ApiExporter } from './api-exporter.js';
import { TsFile } from './ts-file.js';

export async function processResource(
    this: ApiExporter,
    resource: Resource,
    className: string,
    tsFile: TsFile
) {
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

  if (resource instanceof Container) {
    for (const child of resource.resources.values()) {
      // Determine class name of child resource
      let childClassName = child.name.charAt(0).toUpperCase() + child.name.substring(1);
      if (child instanceof Container)
        childClassName += 'Container';
      else childClassName += 'Resource'

      // Create TsFile for child resource
      const dir = path.dirname(tsFile.filename);
      const basename = dir === '/'
          ? 'root'
          : path.basename(tsFile.filename, path.extname(tsFile.filename));
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
  } else if (resource instanceof Collection) {
    tsFile.addImport('@opra/client', ['HttpCollectionNode']);
    const typeName = resource.type.name || '';
    tsFile.addImport(`/types/${typeName}`, [typeName], true);

    constructorBody += `    const node = this[kClient].collection('${resource.getFullPath()}');\n`;

    for (const [operation, endpoint] of resource.operations.entries()) {
      tsFile.content += `
  /** 
   * ${wrapJSDocString(endpoint.description || '')}
   */      
  readonly ${operation}: HttpCollectionNode<${typeName}>['${operation}'];\n`

      constructorBody += `    this.${operation} = node.${operation}.bind(node);\n`;

    }
  } else if (resource instanceof Singleton) {
    tsFile.addImport('@opra/client', ['HttpSingletonNode']);
    const typeName = resource.type.name || '';
    tsFile.addImport(`/types/${typeName}`, [typeName], true);

    constructorBody += `    const node = this[kClient].singleton('${resource.getFullPath()}');\n`;

    for (const [operation, endpoint] of resource.operations.entries()) {
      tsFile.content += `
  /** 
   * ${wrapJSDocString(endpoint.description || '')}
   */      
  readonly ${operation}: HttpSingletonNode<${typeName}>['${operation}'];\n`

      constructorBody += `    this.${operation} = node.${operation}.bind(node);\n`;
    }
  }

  if (resource.actions.size) {
    tsFile.addImport('@opra/client', ['HttpRequestObservable']);
    for (const [action, endpoint] of resource.actions.entries()) {
      const typeName = endpoint.returnType?.name || 'any';
      const actionPath = resource.getFullPath() + '/' + action;
      let params = '';
      for (const prm of endpoint.parameters.values()) {
        params += `      ${prm.name}: ${prm.type.name || 'any'}`;
        if (prm.isArray) params += '[]';
        params += ';\n';
      }
      params = params ? '{\n' + params + '    }\n  ' : '{}';

      tsFile.content += `
  /** 
   * ${wrapJSDocString(endpoint.description || '')}
   */      
  ${action}(params: ${params}): HttpRequestObservable<${typeName}> {  
    return this[kClient].action('${actionPath}', params);
  }    
`
    }
  }

  tsFile.content += constructorBody + `  }\n\n}\n`;
  return tsFile.content;

}


