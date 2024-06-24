import chalk from 'chalk';

const localNameRegex = /\/opra\/build\/([^\/]*)/;
const moduleNameRegex = /\/node_modules\/([^\/]*)/;
const commonjsExternalRegex = /([^?]*)\?commonjs-external$/;

export function manualChunksResolver({ external, exclude }) {
  let i = 0;
  const logged = [];
  external = external || [];
  exclude = exclude || [];
  const excludeAll = [...exclude, external];
  // noinspection JSUnusedLocalSymbols
  return function manualChunks(id, x) {
    if (!i++)
      console.log(chalk.yellow.bold('======= Processed Packages ====='));
    id = trimZeroChars(id);
    let m;
    let name = (m = localNameRegex.exec(id)) && '@opra/' + m[1];
    if (!name)
      name =
        (m = moduleNameRegex.exec(id) || commonjsExternalRegex.exec(id)) &&
        m[1];
    if (name) {
      const isLogged = logged.includes(name);
      logged.push(name);

      if (external && external.includes(name)) {
        if (!isLogged) console.log(chalk.greenBright('External:'), name);
        return;
      }

      if (!excludeAll.includes(name)) {
        // const xx = x.getModuleInfo(id);
        if (!isLogged) console.log(chalk.yellowBright('Chunked:'), name);
        // console.log('importers:', xx.importers);
        // console.log('dynamicImporters:', xx.importers);
        return name;
      }
      if (!isLogged) console.log(chalk.magentaBright('Bundled:'), name);
      return;
    }
    console.log(chalk.magentaBright('Bundled:'), id);
  };
}

function trimZeroChars(str) {
  while (str && str.charCodeAt(0) === 0) str = str.substring(1);
  return str;
}
