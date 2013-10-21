exports.pre = function (node, parent, prop) {
  var parentFunction = this.currentScope();
  if (parentFunction.arrowThis) {
    parent[prop] = {
      type: 'Identifier',
      name: parentFunction.arrowThis.name,
      loc: node.loc,
      range: node.range
    };
  }
};