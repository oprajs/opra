import path from 'path';
import glob from 'fast-glob';
import fs from 'fs/promises';

export async function copyFiles(cwd, search, destDir, cb) {
  const files = await glob(search, { cwd });
  for (const f of files) {
    const trgFile = path.join(destDir, f);
    await fs.mkdir(path.dirname(trgFile), { recursive: true });
    const srcFile = path.join(cwd, f);
    if (cb)
      await cb(srcFile, trgFile, () => fs.copyFile(path.join(cwd, f), trgFile));
    else await fs.copyFile(path.join(cwd, f), trgFile);
  }
}
