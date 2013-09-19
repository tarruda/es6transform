var esprima = require('esprima');
var escodegen = require('escodegen');
var traverse = require('ast-traverse');


var transformations = {
  ArrowFunctionExpression: function(node, parent) {
    node.type = 'FunctionExpression';
    node.expression = false;
    if (node.body.type !== 'BlockStatement') {
      // expression, wrap into a body/return statement
      node.body = {
        type: 'BlockStatement',
        loc: node.body.loc,
        body: [{
          type: 'ReturnStatement',
          loc: node.body.loc,
          argument: node.body
        }]
      };
    }
  }
};


function transformAst(ast) {
  traverse(ast, {
    post: function(node) {
      if (node.type in transformations) {
        transformations[node.type].apply(this, arguments);
      }
    }
  });
}


function transform(source) {
  var ast = esprima.parse(source, {loc: true});
  transformAst(ast);
  return escodegen.generate(ast, {indent: '  '});
}


exports.transformAst = transformAst;
exports.transform = transform;
