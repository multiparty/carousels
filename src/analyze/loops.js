const iterationCountForEach = function (node, childrenType) {
  return childrenType.range.size().size;
};

const iterationCountFor = function (node, childrenType) {
  throw new Error('iterationCountFor is not implemented yet!');
};

module.exports = {
  iterationCountForEach: iterationCountForEach,
  iterationCountFor: iterationCountFor
};