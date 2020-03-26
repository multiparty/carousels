function ScopedMap(error, dVal) {
  this.scopes = [{}];
  this.error = error !== false;
  this.dVal = dVal;
}
ScopedMap.prototype.PLACEHOLDER = '###';
ScopedMap.prototype.addScope = function () {
  this.scopes.push({});
};
ScopedMap.prototype.removeScope = function () {
  this.scopes.pop();
};
ScopedMap.prototype.add = function (name, val) {
  const index = this.scopes.length - 1;
  if (this.scopes[index][name] != null && val === this.PLACEHOLDER) {
    return; // redefining a variable in the same scope does not require a placeholder
  }
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
ScopedMap.prototype.get = function (name, d, countPlaceHolder) {
  countPlaceHolder = countPlaceHolder != null ? countPlaceHolder : false;

  for (let i = this.scopes.length - 1; i >= 0; i--) {
    const scope = this.scopes[i];
    const val = scope[name];
    if (val != null && (countPlaceHolder || val !== this.PLACEHOLDER)) {
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
ScopedMap.prototype.has = function (name, countPlaceHolder) {
  countPlaceHolder = countPlaceHolder == null ? false : countPlaceHolder;
  return this.lastIndexOf(name, countPlaceHolder) > -1;
};
ScopedMap.prototype.lastIndexOf = function (name, countPlaceHolder) {
  countPlaceHolder = countPlaceHolder == null ? false : countPlaceHolder;

  for (let i = this.scopes.length - 1; i >= 0; i--) {
    const scope = this.scopes[i];
    const val = scope[name];
    if (val != null && (countPlaceHolder || val !== this.PLACEHOLDER)) {
      return i;
    }
  }
  return -1;
};
ScopedMap.prototype.lookInCurrentScope = function (name) {
  const val = this.scopes[this.scopes.length - 1][name];
  return val !== this.PLACEHOLDER ? val : null;
};

module.exports = ScopedMap;