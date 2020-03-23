function Enum(name, values) {
  this.__name = name;
  this.__values = values;
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    this[val] = val;

    if (Enum.prototype[val] != null) {
      throw new Error('Cannot use reserved value "' + val + '" inside Enum "' + this.__name + '"!');
    }
  }
}

Enum.prototype.__name = 'ENUM_NAME';
Enum.prototype.__values = 'ENUM_VALUES';
Enum.prototype.__has = function (val) {
  return this.__values.indexOf(val) > -1;
};
Enum.prototype.__assert = function (val) {
  if (!this.__has(val)) {
    throw new Error('Illegal value "' + val + '" for Enum "' + this.__name + '"!');
  }
};

module.exports = Enum;