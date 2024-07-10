import path from 'node:path';
import typeIs from '@browsery/type-is';
import { HttpController, HttpParameter, MimeTypes } from '@opra/common';
import { camelCase, pascalCase } from 'putil-varhelpers';
import { CodeBlock } from '../../code-block.js';
import type { TsGenerator } from '../ts-generator';
import { locateNamedType } from '../utils/locate-named-type.js';
import { wrapJSDocString } from '../utils/string-utils.js';

export async function generateHttpController(this: TsGenerator, controller: HttpController) {
  let file = this._filesMap.get(controller);
  if (file) return file;

  const className = pascalCase(controller.name) + 'Controller';
  file = this.addFile(path.join(this._apiPath, className + '.ts'));
  file.addImport('@opra/client', ['HttpRequestObservable', 'kClient', 'OpraHttpClient']);
  file.addImport(path.relative(file.dirname, '/http-controller-node.ts'), ['HttpControllerNode']);

  const classBlock = (file.code[className] = new CodeBlock());

  classBlock.doc = `/** 
 * ${wrapJSDocString(controller.description || '')}
 * @class ${className}
 * @url ${path.posix.join(this.serviceUrl, '$schema', '#resources/' + className)}
 */`;
  classBlock.head = `\nexport class ${className} extends HttpControllerNode {\n\t`;
  classBlock.properties = '';

  const classConstBlock = (classBlock.classConstBlock = new CodeBlock());
  classConstBlock.head = `\n\nconstructor(client: OpraHttpClient) {`;
  classConstBlock.body = `\n\tsuper(client);`;
  classConstBlock.tail = `\b\n}\n`;

  if (controller.controllers.size) {
    for (const child of controller.controllers.values()) {
      const generator = this.extend();
      generator._apiPath = path.join(this._apiPath, className);
      const f = await generator.generateHttpController(child);
      const childClassName = pascalCase(child.name) + 'Controller';
      file.addImport(f.filename, [childClassName]);
      const property = '$' + child.name.charAt(0).toLowerCase() + camelCase(child.name.substring(1));
      classBlock.properties += `\nreadonly ${property}: ${childClassName};`;
      classConstBlock.body += `\nthis.${property} = new ${childClassName}(client);`;
    }
  }

  /** Process operations */
  for (const operation of controller.operations.values()) {
    const operationBlock = (classBlock['operation_' + operation.name] = new CodeBlock());

    operationBlock.doc = `
/** 
 * ${wrapJSDocString(operation.description || operation.name + ' operation')}`;

    if (operation.parameters.length) {
      const block = new CodeBlock();
      block.doc = '\n *\n * RegExp parameters:';
      let i = 0;
      for (const prm of operation.parameters) {
        if (!(prm.name instanceof RegExp)) continue;
        i++;
        block.doc +=
          `\n *   > ${String(prm.name)} - ${prm.description || ''}` +
          `\n *       - location: ${prm.location}` +
          `\n *       - type: ${locateNamedType(prm.type)?.name || 'any'}${prm.isArray ? '[' + prm.arraySeparator + ']' : ''}` +
          (prm.required ? `\n *      required: ${prm.required}` : '') +
          (prm.deprecated ? `\n *      deprecated: ${prm.deprecated}` : '');
      }
      if (i) operationBlock.doc += block;
    }
    operationBlock.doc += `\n */\n`;

    operationBlock.head = `${operation.name}(`;

    /** Process operation parameters */
    const mergedParams = [...controller.parameters, ...operation.parameters];
    const pathParams: HttpParameter[] = [];
    const queryParams: HttpParameter[] = [];
    const headerParams: HttpParameter[] = [];
    if (mergedParams.length) {
      const pathParamsMap: Record<string, HttpParameter> = {};
      const queryParamsMap: Record<string, HttpParameter> = {};
      const headerParamsMap: Record<string, HttpParameter> = {};
      for (const prm of mergedParams) {
        if (typeof prm.name !== 'string') continue;
        if (prm.location === 'path') pathParamsMap[prm.name] = prm;
        if (prm.location === 'query') queryParamsMap[prm.name] = prm;
        if (prm.location === 'header') headerParamsMap[prm.name] = prm;
      }
      pathParams.push(...Object.values(pathParamsMap));
      queryParams.push(...Object.values(queryParamsMap));
      headerParams.push(...Object.values(headerParamsMap));
    }

    let argIndex = 0;
    for (const prm of pathParams) {
      let typeName: string;
      if (prm.type) {
        const xt = await this.generateDataType(prm.type, 'typeDef', file);
        typeName = xt.kind === 'embedded' ? xt.code : xt.typeName;
      } else typeName = `any`;
      if (argIndex++ > 0) operationBlock.head += ', ';
      operationBlock.head += `${prm.name}: ${typeName}`;
    }

    let hasBody = false;
    if (operation.requestBody?.content.length) {
      if (argIndex++ > 0) operationBlock.head += ', ';
      let typeArr: string[] = [];
      for (const content of operation.requestBody.content) {
        if (content.type) {
          const xt = await this.generateDataType(content.type, 'typeDef', file);
          let typeDef = xt.kind === 'embedded' ? xt.code : xt.typeName;
          if (typeDef === 'any') {
            typeArr = [];
            break;
          }
          if (typeDef) {
            if (operation.requestBody.partial) {
              file.addImport('ts-gems', ['PartialDTO']);
              typeDef = `PartialDTO<${typeDef}>`;
            } else {
              file.addImport('ts-gems', ['DTO']);
              typeDef = `DTO<${typeDef}>`;
            }
          }
          typeDef = typeDef || 'undefined';
          if (!typeArr.includes(typeDef)) typeArr.push(typeDef);
          continue;
        }
        typeArr = [];
        break;
      }
      operationBlock.head += `$body: ${typeArr.join(' | ') || 'any'}`;
      hasBody = true;
    }

    /** process query params */
    const isQueryRequired = queryParams.find(p => p.required);
    const isHeadersRequired = queryParams.find(p => p.required);

    if (queryParams.length) {
      if (argIndex++ > 0) operationBlock.head += ', ';
      operationBlock.head += '\n\t$params' + (isHeadersRequired || isQueryRequired ? '' : '?') + ': {\n\t';

      for (const prm of queryParams) {
        operationBlock.head += `/**\n * ${prm.description || ''}\n */\n`;
        operationBlock.head += `${prm.name}${prm.required ? '' : '?'}: `;
        if (prm.type) {
          const xt = await this.generateDataType(prm.type, 'typeDef', file);
          const typeDef = xt.kind === 'embedded' ? xt.code : xt.typeName;
          operationBlock.head += `${typeDef};\n`;
        } else operationBlock.head += `any;\n`;
      }
      operationBlock.head += '\b}\b';
    }

    /** process header params */
    if (headerParams.length) {
      if (argIndex++ > 0) operationBlock.head += ', \n';
      operationBlock.head += '\t$headers' + (isHeadersRequired ? '' : '?') + ': {\n\t';

      for (const prm of headerParams) {
        operationBlock.head += `/**\n * ${prm.description || ''}\n */\n`;
        operationBlock.head += `${prm.name}${prm.required ? '' : '?'}: `;
        if (prm.type) {
          const xt = await this.generateDataType(prm.type, 'typeDef', file);
          const typeDef = xt.kind === 'embedded' ? xt.code : xt.typeName;
          operationBlock.head += `${typeDef};\n`;
        } else operationBlock.head += `any;\n`;
      }
      operationBlock.head += '\b}\b';
    }

    /* Determine return type */
    let returnTypes: string[] = [];
    let typeDef = '';
    for (const resp of operation.responses) {
      if (!resp.statusCode.find(r => r.intersects(200, 299))) continue;
      typeDef = '';
      if (resp.type) {
        const xt = await this.generateDataType(resp.type, 'typeDef', file);
        typeDef = xt.kind === 'embedded' ? xt.code : xt.typeName;
      }
      if (typeDef) {
        if (typeDef !== 'OperationResult') {
          if (resp.partial) {
            file.addImport('ts-gems', ['PartialDTO']);
            typeDef = `PartialDTO<${typeDef}>`;
          } else {
            file.addImport('ts-gems', ['DTO']);
            typeDef = `DTO<${typeDef}>`;
          }
        }
      }
      if (resp.contentType && typeIs.is(String(resp.contentType), [MimeTypes.opra_response_json])) {
        file.addImport('@opra/common', ['OperationResult']);
        typeDef = typeDef ? `OperationResult<${typeDef}>` : 'OperationResult';
      }
      typeDef = typeDef || 'undefined';
      if (!returnTypes.includes(typeDef)) returnTypes.push(typeDef);
    }

    operationBlock.head += `\n): HttpRequestObservable<${returnTypes.join(' | ') || 'any'}>{`;

    operationBlock.body = `\n\t`;
    operationBlock.body +=
      `const url = this._prepareUrl('${operation.getFullUrl()}', {` + pathParams.map(p => p.name).join(', ') + '});';
    operationBlock.body +=
      `\nreturn this[kClient].request(url, { method: '${operation.method}'` +
      (hasBody ? ', body: $body' : '') +
      (queryParams.length ? ', params: $params as any' : '') +
      (headerParams.length ? ', headers: $headers as any' : '') +
      '});';

    operationBlock.tail = `\b\n};\n`;
  }

  classBlock.tail = `\b}`;

  return file;
}
