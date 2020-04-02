function ScopedMap(error, dVal) {
  this.scopes = [{}];
  this.error = error !== false;
  this.dVal = dVal;
}
ScopedMap.prototype.addScope = function () {
  this.scopes.push({});
};
ScopedMap.prototype.removeScope = function () {
  this.scopes.pop();
};
ScopedMap.prototype.add = function (name, val) {
  const index = this.scopes.length - 1;
  this.scopes[index][name] = val;
};
ScopedMap.prototype.set = function (name, val) {
  for (let i = this.scopes.length - 1; i >= 0; i--) {
    const scope = this.scopes[i];
    if (scope[name] != null) {
      scope[name] = val;
      return;
    }
  }
  this.add(name, val);
};
ScopedMap.prototype.get = function (name, d) {
  for (let i = this.scopes.length - 1; i >= 0; i--) {
    const scope = this.scopes[i];
    const val = scope[name];
    if (val != null) {
      return val;
    }
  }

  if (d !== undefined) {
    return d;
  }

  if (this.error) {
    throw new Error('Scoped Map attempted to access symbol "' + name + '" that is not in scope!');
  }

  return this.dVal;
};
ScopedMap.prototype.has = function (name) {
  return this.lastIndexOf(name) > -1;
};
ScopedMap.prototype.lastIndexOf = function (name) {
  for (let i = this.scopes.length - 1; i >= 0; i--) {
    const scope = this.scopes[i];
    const val = scope[name];
    if (val != null) {
      return i;
    }
  }
  return -1;
};
ScopedMap.prototype.lookInCurrentScope = function (name) {
  const val = this.scopes[this.scopes.length - 1][name];
  return val;
};

module.exports = ScopedMap;