function tryRequire(module) {
  try {
    return require(module);
  } catch {
    //
  }
}

const ClassValidator = tryRequire('class-validator');
const NestJSCommon = tryRequire('@nestjs/common');

export {
  ClassValidator,
  NestJSCommon
};
