const If = require('./if.js');

const OblivIf = function (node, pathStr) {
  return If.If(node, pathStr + 'obliv');
};

module.exports = {
  OblivIf: OblivIf
};