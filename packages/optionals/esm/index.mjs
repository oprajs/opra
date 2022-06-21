async function tryImport(module) {
  try {
    return await import(module);
  } catch {
    //
  }
}

const ClassValidator = await tryImport('class-validator');
const NestJSCommon = await tryImport('@nestjs/common');

export {
  ClassValidator,
  NestJSCommon
};
