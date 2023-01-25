import fs from 'fs';
import path from 'path';

export function deleteFiles(dirname: string) {
  const files = fs.readdirSync(dirname);
  for (const f of files) {
    const filename = path.join(dirname, f);
    if (fs.statSync(filename).isDirectory()) {
      deleteFiles(filename);
      if (!fs.readdirSync(filename).length)
        fs.rmdirSync(filename);
      continue;
    }
    if (path.extname(f) === '.ts') {
      const contents = fs.readFileSync(filename, 'utf-8');
      if (contents.includes('#!oprimp_auto_generated!#')) {
        fs.unlinkSync(filename);
      }
    }
  }
}
