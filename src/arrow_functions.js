var traverse = require('ast-traverse');


function thisMaterialized(arrowFunc) {
  var rv = false;

  traverse(arrowFunc, {
    pre: function(node) {
      if (node.type === 'FunctionExpression' ||
          node.type === 'FunctionDeclaration') {
        // normal function introduces a new dynamic 'this' scope, no need
        // to descend
        return false;
      } 

      if (node.type === 'ThisExpression') {
        rv = true;
      }
    }
  });

  return rv;
}


exports.pre = function(node) {
  if (thisMaterialized(node.body)) {
    var parent = this.currentScope();
    // Find the closest non-arrow function parent scope
    while (parent.type === 'ArrowFunctionExpression') {
      parent = this.currentScope(parent);
    }
    // ensure its context is bound to the '_this' variable and
    // save a reference to it in the node so all children of type
    // 'ThisExpression' can replace themselves
    node.arrowThis = this.ensureVar(this.arrowThis, parent, {
      type: 'ThisExpression'
    });
  }
};


exports.post = function(node) {
  node.type = 'FunctionExpression';
  node.expression = false;

  if (node.body.type !== 'BlockStatement') {
    // expression, wrap into a body/return statement
    node.body = {
      type: 'BlockStatement',
      body: [{
        type: 'ReturnStatement',
        argument: node.body
      }]
    };
  }
};
