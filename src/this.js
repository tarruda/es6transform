exports.enter = function(node) {
  var parentFunction = this.currentScope().block;

  if (parentFunction.arrowThis) {
    return parentFunction.arrowThis;
  }
};
