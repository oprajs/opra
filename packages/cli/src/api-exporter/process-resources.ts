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
  tsFile.addImport('@opra/client', ['HttpServiceBase', 'kClient', 'kContext']);
  const indexTs = this.addFile('/index.ts', true);
  indexTs.addExport(tsFile.filename);

  tsFile.content = `\n
/** 
 * ${wrapJSDocString(resource.description || '')}
 * @class ${className}
 * @url ${path.posix.join(this.client.serviceUrl, '#resources/' + className)}
 */  
export class ${className} extends HttpServiceBase {\n`;


  if (resource instanceof Container) {
    for (const child of resource.resources.values()) {
      // Determine class name of child resource
      let childClassName = '';
      if (child instanceof Container)
        childClassName = child.name.charAt(0).toUpperCase() + child.name.substring(1) + 'Container';
      else childClassName = child.name + 'Resource';

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
  get ${child.name}(): ${childClassName} {
    if (!this[kContext].resources.${child.name})
      this[kContext].resources.${child.name} = new ${childClassName}(this[kClient]);     
    return this[kContext].resources.${child.name};
  }\n`;
    }
  } else if (resource instanceof Collection) {
    tsFile.addImport('@opra/client', ['HttpCollectionNode']);
    const typeName = resource.type.name || '';
    tsFile.addImport(`/types/${typeName}`, [typeName], true);

    for (const [operation, endpoint] of resource.operations.entries()) {
      tsFile.content += `
  /** 
   * ${wrapJSDocString(endpoint.description || '')}
   */      
  get ${operation}(): HttpCollectionNode<${typeName}>['${operation}'] {
    if (!this[kContext].node)
      this[kContext].node = this[kClient].collection('${resource.name}');  
    return this[kContext].node.${operation};
  }    
`
    }
  } else if (resource instanceof Singleton) {
    tsFile.addImport('@opra/client', ['HttpSingletonNode']);
    const typeName = resource.type.name || '';
    tsFile.addImport(`/types/${typeName}`, [typeName], true);

    for (const [operation, endpoint] of resource.operations.entries()) {
      tsFile.content += `
  /** 
   * ${wrapJSDocString(endpoint.description || '')}
   */      
  get ${operation}(): HttpSingletonNode<${typeName}>['${operation}'] {
    if (!this[kContext].node)
      this[kContext].node = this[kClient].singleton('${resource.name}');  
    return this[kContext].node.${operation};
  }    
`
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

  tsFile.content += `}\n`;
  return tsFile.content;

}


