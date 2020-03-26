// This is a lot like a scope map, except that it is not a map!
// a path tracker consists of several scopes organized as a stack
// each scope is a single array containing elements of some desired nature
// a path tracker allows for easily adding and removing elements we are interested in tracking (parameters, conditions)
// throughout a visit path, as the path is visited/back-traced
// a path tracker allows access to the tracked element either by level (via accessing .scopes), or all together as a
// flattened ordered array (via .retrieveAll())

function PathTracker() {
  this.scopes = [[]];
}
PathTracker.prototype.addScope = function () {
  this.scopes.push([]);
};
PathTracker.prototype.removeScope = function () {
  this.scopes.pop();
};
PathTracker.prototype.add = function (element) {
  const index = this.scopes.length - 1;
  this.scopes[index].push(element);
};
PathTracker.prototype.concat = function (elements) {
  const index = this.scopes.length - 1;
  this.scopes[index] = this.scopes[index].concat(elements);
};
PathTracker.prototype.retrieveAll = function (startIndex) {
  startIndex = startIndex == null ? 0 : startIndex;
  return this.scopes.slice(startIndex).reduce(function (acc, scope) {
    return acc.concat(scope);
  }, []);
};

module.exports = PathTracker;