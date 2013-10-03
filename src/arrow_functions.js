var estraverse = require('estraverse');


function thisMaterialized(arrowFunc) {
  var rv = false;

  estraverse.traverse(arrowFunc, {
    enter: function(node) {
      if (node.type === 'FunctionExpression' ||
          node.type === 'FunctionDeclaration') {
        // normal function introduces a new dynamic 'this' scope, no need
        // to descend
        return estraverse.VisitorOption.SKIP;
      } 

      if (node.type === 'ThisExpression') {
        rv = true;
        return estraverse.VisitorOption.BREAK;
      }
    }
  });

  return rv;
}


exports.enter = function(node) {
  var rv = {
    type: 'FunctionExpression',
    id: node.id,
    params: node.params,
    defaults: node.defaults,
    rest: node.rest,
    body: node.body,
    generator: node.generator,
    expression: false
  };

  if (thisMaterialized(node)) {
    var parent = this.currentScope();
    // Find the closest non-arrow function parent scope
    while (parent.block.type === 'ArrowFunctionExpression') {
      parent = parent.upper;
    }
    // ensure its context is bound to the '_this' variable and
    // save a reference to it in the node so all children of type
    // 'ThisExpression' can replace themselves
    node.arrowThis = this.ensureVar(this.arrowThis, parent, {
      type: 'ThisExpression'
    });
  }

  if (rv.body.type !== 'BlockStatement') {
    // expression, wrap into a body/return statement
    rv.body = {
      type: 'BlockStatement',
      body: [{
        type: 'ReturnStatement',
        argument: rv.body
      }]
    };
  }
  return rv;
};

