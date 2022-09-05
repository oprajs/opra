function tryRequire(module) {
  try {
    return require(module);
  } catch {
    //
  }
}

const ClassValidator = tryRequire('class-validator');
const NestJSCommon = tryRequire('@nestjs/common');
const SqbConnect = tryRequire('@sqb/connect');

module.exports = {
  ClassValidator,
  NestJSCommon,
  SqbConnect
};
