function SymbolTable() {
  this.scopes = [{}];
}
SymbolTable.prototype.addScope = function () {
  this.scopes.push({});
};
SymbolTable.prototype.removeScope = function () {
  this.scopes.pop();
};
SymbolTable.prototype.addSymbol = function (name, type) {
  const index = this.scopes.length - 1;
  this.scopes[index][name] = type;
};
SymbolTable.prototype.getSymbol = function (name) {
  for (let i = this.scopes.length - 1; i >= 0; i--) {
    const scope = this.scopes[i];
    const type = scope[name];
    if (type != null) {
      return type;
    }
  }
};

module.exports = SymbolTable;