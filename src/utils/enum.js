function Enum() {
  this.__name = arguments[0];
  this.__values = Array.from(arguments).slice(1);
  for (let i = 0; i < arguments.length; i++) {
    const val = arguments[i];
    this[val] = val;

    if (Enum.prototype[val] != null) {
      throw new Error('Cannot use reserved value "' + val + '" inside Enum "' + this.__name + '"!');
    }
  }
}

Enum.prototype.__name = 'ENUM_NAME';
Enum.prototype.__has = function (val) {
  return this.__values.indexOf(val) > -1;
};
Enum.prototype.__assert = function (val) {
  if (!this.__has(val)) {
    throw new Error('Illegal value "' + val + '" for Enum "' + this.__name + '"!');
  }
};

module.exports = Enum;