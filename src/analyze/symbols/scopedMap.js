function ScopedMap() {
  this.scopes = [{}];
}
ScopedMap.prototype.addScope = function () {
  this.scopes.push({});
};
ScopedMap.prototype.removeScope = function () {
  this.scopes.pop();
};
ScopedMap.prototype.add = function (key, val) {
  const index = this.scopes.length - 1;
  this.scopes[index][name] = val;
};
ScopedMap.prototype.get = function (name) {
  for (let i = this.scopes.length - 1; i >= 0; i--) {
    const scope = this.scopes[i];
    const val = scope[name];
    if (val != null) {
      return val;
    }
  }
};

module.exports = ScopedMap;