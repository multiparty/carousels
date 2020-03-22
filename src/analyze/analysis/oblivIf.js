const If = require('./if.js');

const OblivIf = function (node, pathStr) {
  return If.If.call(this, node, pathStr + 'obliv');
};

module.exports = {
  OblivIf: OblivIf
};