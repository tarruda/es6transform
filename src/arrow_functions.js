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

  var parent = this.currentScope();
  // Find the closest non-arrow function parent scope
  while (parent.block.type === 'ArrowFunctionExpression') {
    parent = parent.upper;
  }
  // ensure its context is bound to the '_this' bound variable
  // and save a reference to it
  node.arrowThis = this.ensureVar(this.arrowThis, parent, {
    type: 'ThisExpression'
  });

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

