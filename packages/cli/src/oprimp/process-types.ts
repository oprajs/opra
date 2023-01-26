import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { ComplexType, DataType, joinPath, UnionType } from '@opra/common';
import { ServiceGenerationContext } from '../interfaces/service-generation-context.interface.js';
import { wrapJSDocString } from '../utils/string-utils.js';
import { TsFile } from '../utils/ts-file.js';

const builtinsMap = {
  base64Binary: 'Buffer',
  dateString: 'string',
  guid: 'string',
  integer: 'number',
  date: 'Date'
}

export async function processTypes(ctx: ServiceGenerationContext) {
  const targetDir = path.join(ctx.absoluteDir, 'types');
  ctx.logger.log(chalk.yellow('Processing types'));

  const typesTs = new TsFile();
  typesTs.header = ctx.fileHeader;
  let i = 0;

  const builtinsTs = new TsFile();
  typesTs.header = ctx.fileHeader;

  fs.mkdirSync(targetDir, {recursive: true});
  const typeNames = Array.from(ctx.document.types.keys()).sort();
  for (const typeName of typeNames) {
    const dataType = ctx.document.getDataType(typeName);
    if (dataType.isBuiltin) {
      if (!builtinsMap[dataType.name])
        continue;
      typesTs.addExport('./types/builtins' + ctx.extension);
      builtinsTs.content += `export type ${dataType.name} = ${builtinsMap[dataType.name]};\n`;
      continue;
    }
    const tsFile = new TsFile();
    tsFile.header = ctx.fileHeader;
    tsFile.content = `\n/**\n * ${wrapJSDocString(dataType.description || dataType.name)}
 * @type ${dataType.name}
 * @kind ${dataType.kind}
 * @url ${joinPath(ctx.serviceUrl, '$metadata/types/' + dataType.name)}
 */\n`;

    const filename = `./types/${dataType.name}`;

    if (dataType instanceof ComplexType) {
      await generateComplexType(ctx, dataType, tsFile);
      await tsFile.writeFile(ctx, path.join(targetDir, dataType.name + '.ts'));
      typesTs.addExport(`${filename}` + ctx.extension);
      i++;
    }
  }
  await builtinsTs.writeFile(ctx, path.join(targetDir, 'builtins.ts'));
  if (i) {
    await typesTs.writeFile(ctx, path.join(ctx.absoluteDir, 'types.ts'));
  }
}

async function generateComplexType(
    ctx: ServiceGenerationContext,
    dataType: ComplexType,
    tsFile: TsFile
) {
  tsFile.header = ctx.fileHeader;

  tsFile.content = `
export class ${dataType.name} {
  constructor(init?: Partial<I${dataType.name}>) {
    if (init)
     Object.assign(this, init);
  }
}

export interface ${dataType.name} extends I${dataType.name} {
}

interface I${dataType.name}`;

  if (dataType.extends) {
    tsFile.content += ' extends ' +
        dataType.extends.map(ex => {
          tsFile.addImport('./' + ex.type + ctx.extension, ex.type);
          let s = '';
          if (ex.omit) s += 'Omit<';
          if (ex.pick) s += 'Pick<';
          s += ex.type;
          if (ex.pick) s += ex.pick.map(x => `'${x}`).join(' | ') + '>';
          if (ex.omit) s += ex.omit.map(x => `'${x}`).join(' | ') + '>';
          return s;
        }).join(', ');
  }

  const getTypeName = (dt: DataType): string => {
    if (dt.isBuiltin) {
      if (!builtinsMap[dt.name])
        return dt.name;
      tsFile.addImport('./builtins' + ctx.extension, dt.name);
      return dt.name;
    }
    tsFile.addImport('./' + dt.name + ctx.extension, dt.name);
    return dt.name;
  }

  tsFile.content += ' {\n\t';
  for (const f of dataType.ownFields.values()) {
    const fieldType = ctx.document.getDataType(f.type);

    // Print JSDoc
    let jsDoc = '';
    if (f.description)
      jsDoc += ` * ${f.description}\n`;
    if (f.default)
      jsDoc += ` * @default ` + f.default + '\n';
    if (f.format)
      jsDoc += ` * @format ` + f.format + '\n';
    if (f.exclusive)
      jsDoc += ` * @exclusive\n`;
    if (f.deprecated)
      jsDoc += ` * @deprecated ` + (typeof f.deprecated === 'string' ? f.deprecated : '') + '\n';

    if (jsDoc)
      tsFile.content += `/**\n${jsDoc}*/\n`;
    // Print field name
    tsFile.content += `${f.name}${f.required ? '' : '?'}: `;

    if (f.fixed)
      tsFile.content += `${f.fixed}`;
    else {
      if (fieldType instanceof UnionType) {
        const s = fieldType.types.map(t => getTypeName(t)).join(' | ')
        tsFile.content += `(${s})`;
      } else
        tsFile.content += `${getTypeName(fieldType)}`;
      tsFile.content += `${f.isArray ? '[]' : ''};\n\n`;
    }
  }
  if (dataType.additionalFields)
    tsFile.content += '[key: string]: any;\n';

  tsFile.content += '\b\b}\n';
}
