const bothSecret = function (ops, type) {
  type = type || '(number|bool)@D';
  return '<type:' + type + ',secret:true>(' + ops + ')<type:' + type + ',secret:true>';
};

const oneSecret = function (ops, type) {
  return leftSecret(ops, type) + '|' + rightSecret(ops, type);
};

const leftSecret = function (ops, type) {
  type = type || '(number|bool)@D';
  return '(<type:' + type + ',secret:true>(' + ops + ')<type:' + type + ',secret:false>)';
};

const rightSecret = function (ops, type) {
  type = type || '(number|bool)@D';
  return '(<type:' + type + ',secret:false>(' + ops + ')<type:' + type + ',secret:true>)';
};

const eitherSecret = function (ops, type) {
  return '(' + bothSecret(ops, type) + ')|(' + oneSecret(ops, type) + ')';
};

module.exports = {
  BOTH_SECRET_REGEX: bothSecret,
  ONE_SECRET_REGEX: oneSecret,
  LEFT_SECRET_REGEX: leftSecret,
  RIGHT_SECRET_REGEX: rightSecret,
  EITHER_SECRET_REGEX: eitherSecret
};