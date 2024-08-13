const fs = require('node:fs');
const path = require('node:path');

function clearPackageJson() {
  const project = path.basename(process.cwd());
  const filename = path.resolve(__dirname, '../build', project, 'package.json');
  const json = JSON.parse(fs.readFileSync(filename, 'utf-8'));
  delete json.private;
  delete json.scripts;
  delete json.devDependencies;
  fs.writeFileSync(filename, JSON.stringify(json, undefined, 2));
}

clearPackageJson();
