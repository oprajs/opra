import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { ComplexType, DataType, joinPath, UnionType } from '@opra/common';
import { ServiceGenerationContext } from '../interfaces/service-generation-context.interface.js';
import { wrapJSDocString } from '../utils/string-utils.js';
import { TsFile } from '../utils/ts-file.js';

export async function generateTypes(ctx: ServiceGenerationContext) {
  const targetDir = path.join(ctx.absoluteDir, 'types');
  ctx.logger.log(chalk.yellow('Generating types'));

  fs.mkdirSync(targetDir, {recursive: true});
  const typeNames = Array.from(ctx.document.types.keys()).sort();
  for (const typeName of typeNames) {
    const dataType = ctx.document.getDataType(typeName);
    if (dataType.isBuiltin)
      continue;
    const tsFile = new TsFile();
    tsFile.header = ctx.fileHeader;
    tsFile.content = `\n/**\n * ${wrapJSDocString(dataType.description || dataType.name)}
 * @type ${dataType.name}
 * @kind ${dataType.kind}
 * @url ${joinPath(ctx.serviceUrl, '$metadata/types/' + dataType.name)}
 */\n`;

    if (dataType instanceof ComplexType) {
      await generateComplexType(ctx, dataType, tsFile);
      await tsFile.writeFile(ctx, path.join(targetDir, dataType.name + '.ts'));
    }
  }
}

async function generateComplexType(
    ctx: ServiceGenerationContext,
    dataType: ComplexType,
    tsFile: TsFile
) {
  const filename = `./types/${dataType.name}`;
  ctx.indexTs.addExport(`${filename}.js`);

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
          tsFile.addImport('./' + ex.type + '.js', ex.type);
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
      if (dt.name === 'any' || dt.name === 'string' || dt.name === 'number' ||
          dt.name === 'boolean' || dt.name === 'object')
        return dt.name;
      if (dt.name === 'date')
        return 'Date';
      tsFile.addImport('../builtins.js', dt.name);
      ctx.builtins[dt.name] = true;
      return dt.name;
    }
    tsFile.addImport('./' + dt.name + '.js', dt.name);
    return dt.name;
  }

  tsFile.content += ' {\n\t';
  for (const f of dataType.ownFields.values()) {
    const fieldType = ctx.document.getDataType(f.type);

    // Print JSDoc
    tsFile.content += `/**\n * ${f.description || f.name}\n`;
    if (f.default)
      tsFile.content += ` * @default ` + f.default + '\n';
    if (f.format)
      tsFile.content += ` * @format ` + f.format + '\n';
    if (f.exclusive)
      tsFile.content += ` * @exclusive\n`;
    if (f.deprecated)
      tsFile.content += ` * @deprecated ` + (typeof f.deprecated === 'string' ? f.deprecated : '') + '\n';
    tsFile.content += ` */\n`;
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
