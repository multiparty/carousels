const bothSecret = function (ops) {
  return '<type:(number|bool)@D,secret:true>(' + ops + ')<type:(number|bool)@D,secret:true>';
};

const oneSecret = function (ops) {
  return leftSecret(ops) + '|' + rightSecret(ops);
};

const leftSecret = function (ops) {
  return '(<type:(number|bool)@D,secret:true>(' + ops + ')<type:(number|bool)@D,secret:false>)';
};

const rightSecret = function (ops) {
  return '(<type:(number|bool)@D,secret:false>(' + ops + ')<type:(number|bool)@D,secret:true>)';
};

module.exports = {
  BOTH_SECRET_REGEX: bothSecret,
  ONE_SECRET_REGEX: oneSecret,
  LEFT_SECRET_REGEX: leftSecret,
  RIGHT_SECRET_REGEX: rightSecret
};