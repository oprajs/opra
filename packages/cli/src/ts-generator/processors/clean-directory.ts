import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import type { TsGenerator } from '../ts-generator';

export function cleanDirectory(this: TsGenerator, dirname: string) {
  const rootDir = dirname;
  const _cleanDirectory = (targetDir: string) => {
    if (!fs.existsSync(targetDir)) return;
    const files = fs.readdirSync(targetDir);
    for (const f of files) {
      const absolutePath = path.join(targetDir, f);
      if (fs.statSync(absolutePath).isDirectory()) {
        _cleanDirectory(absolutePath);
        if (!fs.readdirSync(absolutePath).length) {
          this.emit('verbose', chalk.cyan(`Removing directory ${path.relative(absolutePath, rootDir)}`));
          fs.rmdirSync(absolutePath);
        }
        continue;
      }
      if (path.extname(f) === '.ts') {
        const contents = fs.readFileSync(absolutePath, 'utf-8');
        if (contents.includes('#!oprimp_auto_generated!#')) {
          this.emit('verbose', chalk.cyan(`Removing file ${path.relative(absolutePath, rootDir)}`));
          fs.unlinkSync(absolutePath);
        }
      }
    }
  };
  _cleanDirectory(dirname);
}
