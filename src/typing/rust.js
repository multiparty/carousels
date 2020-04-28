const typeFiles = [
  require('./rust/arithmetic.js'),
  require('./rust/array.js'),
  require('./rust/bool.js'),
  require('./rust/matrix.js'),
  require('./rust/float.js'),
  require('./rust/std.js'),
  require('./rust/vector.js'),
  require('./rust/rng.js'),
  require('./rust/hints.js')
];

let allRules= [];
for (let i = 0; i < typeFiles.length; i++) {
  allRules = allRules.concat(typeFiles[i]);
}

module.exports = allRules;