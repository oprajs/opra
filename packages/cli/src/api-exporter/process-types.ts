import chalk from 'chalk';
import path from 'node:path';
import { ComplexType, DataType, EnumType, joinPath, MappedType, SimpleType, UnionType } from '@opra/common';
import { wrapJSDocString } from '../utils/string-utils.js';
import type { ApiExporter } from './api-exporter.js';
import { TsFile } from './ts-file.js';

const internalTypeNames = ['boolean', 'bigint', 'number', 'null', 'string'];

/**
 *
 * @param targetDir
 */
export async function processTypes(
    this: ApiExporter,
    targetDir: string = ''
) {
  this.logger.log(chalk.yellow('Processing types'));
  const {document} = this;
  const typesTs = this.addFile(path.join(targetDir, 'types.ts'));
  for (const dataType of document.types.values()) {
    const expFile = await this.generateTypeFile(dataType, targetDir);
    typesTs.addExportFile(expFile.filename);
  }
}

/**
 *
 * @param dataType
 * @param targetDir
 */
export async function generateTypeFile(
    this: ApiExporter,
    dataType: DataType,
    targetDir: string = ''
): Promise<TsFile> {
  const typeName = dataType.name;
  if (!typeName)
    throw new TypeError(`DataType has no name`);

  let filePath: string;
  if (dataType instanceof SimpleType)
    filePath = '/simple-types.ts';
  else if (dataType instanceof ComplexType)
    filePath = `/types/${typeName}-type.ts`;
  else if (dataType instanceof EnumType) {
    filePath = `/enums/${typeName}-enum.ts`;
  } else
    throw new TypeError(`Unimplemented DataType (${dataType.kind})`);

  const file = this.addFile(path.join(targetDir, filePath), true);
  if (file.exportTypes.includes(typeName))
    return file;
  file.exportTypes.push(typeName);

  const indexTs = this.addFile('/index.ts', true);
  indexTs.addExportFile(file.filename);

  file.content += `\n/**\n * ${wrapJSDocString(dataType.description || typeName)}
 * @interface ${typeName}
 * @kind ${dataType.kind}
 * @url ${joinPath(this.client.serviceUrl, '$metadata#types/' + typeName)}
 */\n`;

  if (dataType instanceof SimpleType) {
    file.content += `export type ${typeName} = ` + await this.generateSimpleTypeDefinition(file, dataType);
  } else if (dataType instanceof EnumType) {
    file.content += `export enum ${typeName} ` + await this.generateEnumTypeDefinition(file, dataType);
  } else if (dataType instanceof ComplexType) {
    file.content += `export interface ${typeName} ${await this.generateComplexTypeDefinition(file, dataType, true)}`
  }

  return file;
}

/**
 *
 * @param file
 * @param dataType
 * @param forInterface
 */
export async function resolveTypeNameOrDef(
    this: ApiExporter,
    file: TsFile,
    dataType: DataType,
    forInterface?: boolean
): Promise<string> {
  if (dataType.name) {
    if (internalTypeNames.includes(dataType.name))
      return dataType.name;
    const f = await this.generateTypeFile(dataType);
    file.addImportFile(f.filename, [dataType.name]);
    return dataType.name;
  }
  if (dataType instanceof ComplexType)
    return this.generateComplexTypeDefinition(file, dataType, forInterface);
  if (dataType instanceof SimpleType)
    return this.generateSimpleTypeDefinition(file, dataType);
  if (dataType instanceof EnumType)
    return this.generateEnumTypeDefinition(file, dataType);
  if (dataType instanceof UnionType)
    return this.generateUnionTypeDefinition(file, dataType, forInterface);
  if (dataType instanceof MappedType)
    return this.generateMappedTypeDefinition(file, dataType, forInterface);

  return 'xxx';
}

/**
 *
 * @param file
 * @param dataType
 * @param forInterface
 */
export async function generateComplexTypeDefinition(
    this: ApiExporter,
    file: TsFile,
    dataType: ComplexType,
    forInterface?: boolean
): Promise<string> {
  let out = '';
  if (dataType.base) {
    const base = await this.resolveTypeNameOrDef(file, dataType.base, forInterface);
    out += forInterface ? `extends ${base} ` : `${base} & `;
  }

  out += '{\n\n\t';
  for (const field of dataType.own.fields.values()) {

    // Print JSDoc
    let jsDoc = '';
    if (field.description)
      jsDoc += ` * ${field.description}\n`;
    if (field.default)
      jsDoc += ` * @default ` + field.default + '\n';
    if (field.format)
      jsDoc += ` * @format ` + field.format + '\n';
    if (field.exclusive)
      jsDoc += ` * @exclusive\n`;
    if (field.deprecated)
      jsDoc += ` * @deprecated ` + (typeof field.deprecated === 'string' ? field.deprecated : '') + '\n';

    if (jsDoc)
      out += `/**\n${jsDoc}*/\n`;

    // Print field name
    out += `${field.name}${field.required ? '' : '?'}: `;

    if (field.fixed)
      out += `${field.fixed}`;
    else {
      out += await this.resolveTypeNameOrDef(file, field.type) +
          `${field.isArray ? '[]' : ''};\n\n`;
    }
  }
  if (dataType.additionalFields)
    out += '[key: string]: any;\n';
  return out + '\b}';
}


/**
 *
 * @param file
 * @param dataType
 */
export async function generateSimpleTypeDefinition(
    this: ApiExporter,
    file: TsFile,
    dataType: SimpleType
): Promise<string> {
  if (dataType.ctor === Boolean)
    return 'boolean';
  if (dataType.ctor === String)
    return 'string';
  if (dataType.ctor === Number)
    return 'number';
  if (dataType.ctor === Date)
    return 'Date';
  if (dataType.extendsFrom('bigint'))
    return 'Date';
  if (dataType.extendsFrom('object'))
    return 'object';
  return 'any';
}

/**
 *
 * @param file
 * @param dataType
 */
export async function generateEnumTypeDefinition(
    this: ApiExporter,
    file: TsFile,
    dataType: EnumType
): Promise<string> {
  let out = '{\n\t';
  for (const [k, v] of Object.entries(dataType.values)) {

    // Print JSDoc
    let jsDoc = '';
    if (dataType.meanings[k])
      jsDoc += ` * ${dataType.meanings[k]}\n`;

    if (jsDoc)
      out += `/**\n${jsDoc}*/\n`;

    out += `${k}`;
    if (v)
      out += ' = ' + (typeof v === 'number' ? v : ('"' + ('' + v).replace('"', '\\"')) + '"')
    out += ',\n\n';
  }
  return out + '\b}';
}

/**
 *
 * @param file
 * @param dataType
 * @param forInterface
 */
export async function generateUnionTypeDefinition(
    this: ApiExporter,
    file: TsFile,
    dataType: UnionType,
    forInterface?: boolean
): Promise<string> {
  // let out = '';
  return (await Promise.all(
      dataType.types
          .map(t => this.resolveTypeNameOrDef(file, t, forInterface))
  )).join(forInterface ? ', ' : ' & ');
}

/**
 *
 * @param file
 * @param dataType
 * @param forInterface
 */
export async function generateMappedTypeDefinition(
    this: ApiExporter,
    file: TsFile,
    dataType: MappedType,
    forInterface?: boolean
): Promise<string> {
  return (dataType.pick ? 'Pick<' : 'Omit<') +
      (await this.resolveTypeNameOrDef(file, dataType.type, forInterface)) +
      ', ' +
      (dataType.pick || dataType.omit || [])
          .map(x => `'${x}'`).join(' | ') +
      '>';
}

