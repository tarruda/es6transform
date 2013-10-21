var assign = require('./destructure');
exports.pre = function (node, parent, prop) {
  var scope = this.currentScope();
  var result = [];
  var declaration;
  while (declaration = node.declarations.shift()) {
    var to = declaration.id, from = declaration.init;
    var type = to.type;
    var seq = [];
    if (type === 'ObjectPattern' || type === 'ObjectExpression' || type === 'ArrayPattern' || type === 'ArrayExpression') {
      assign.call(this, to, from, '=', scope, seq);
      for (var i = 0, l = seq.length; i < l; i++) {
        var assignment = seq[i];
        result.push({
          type: 'VariableDeclarator',
          id: assignment.left,
          init: assignment.right
        });
      }
    } else {
      result.push(declaration);
    }
  }
  node.declarations = result;
};