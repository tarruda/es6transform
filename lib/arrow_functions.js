var traverse = require('ast-traverse');
function thisMaterialized(arrowFunc) {
  var rv = false;
  traverse(arrowFunc, {
    pre: function (node) {
      if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
        return false;
      }
      if (node.type === 'ThisExpression') {
        rv = true;
      }
    }
  });
  return rv;
}
exports.pre = function (node) {
  if (thisMaterialized(node.body)) {
    var parent = this.currentScope();
    while (parent.type === 'ArrowFunctionExpression') {
      parent = this.currentScope(parent);
    }
    node.arrowThis = this.ensureVar(this.arrowThis, parent, { type: 'ThisExpression' });
  }
};
exports.post = function (node) {
  node.type = 'FunctionExpression';
  node.expression = false;
  if (node.body.type !== 'BlockStatement') {
    node.body = {
      type: 'BlockStatement',
      body: [{
          type: 'ReturnStatement',
          argument: node.body
        }]
    };
  }
};