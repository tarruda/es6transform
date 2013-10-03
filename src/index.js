var _ = require('lodash');
var klass = require('klass');
var esprima = require('esprima');
var escodegen = require('escodegen');
var traverse = require('ast-traverse');


function collectIdentifiers(ast) {
  var rv = {};

  traverse(ast, {
    pre: function(node) {
      if (node.type === 'Identifier')
        rv[node.name] = true;
    }
  });

  return rv;
}

var transformations = {
  // Transform ArrowFunctionExpression nodes into FunctionExpression nodes
  ArrowFunctionExpression: require('./arrow_functions'),
  ThisExpression: require('./this'),
  AssignmentExpression: require('./assignment')
};

var WalkContext = klass({
  initialize: function(ast, options) {
    this.options = options;
    this.path = [];
    this.identifiers = collectIdentifiers(ast);
    this.arrowThis = this.unused('_this');
    this.forOfIndex = this.unused('_i');
    this.forOfLength = this.unused('_l');
    this.forOfTemp = this.unused('_a');
    this.tmp = this.unused('_tmp');
  },
  // Finds an identifier name derived from the requested that is not used
  // in the program code for safely usage when translating ast nodes
  unused: function(requested) {
    var name = requested;
    var idx = 2;

    while (this.identifiers[name]) {
      name = requested + idx++;
    }

    return name;
  },
  // Find the closest parent that belongs to one of the types
  closest: function(types, start) {
    return _.findLast(this.path, function(p) { 
      return start !== p && _.contains(types, p.type);
    });
  },
  currentScope: function(start) {
    return this.closest([
      'Program',
      'FunctionExpression',
      'FunctionStatement',
      'ArrowFunctionExpression'
    ], start);
  },
  ensureVar: function(name, scope, init) {
    var body = 
      scope.type === 'Program' ?
      scope.body :
      scope.body.body;

    scope.declared = scope.declared || {};

    var declarations = body[0];

    if (!scope.declared[name]) {
      if (declarations && declarations.type !== 'VariableDeclaration') {
        declarations = {
          type: 'VariableDeclaration',
          declarations: [],
          kind: 'var'
        };
        body.unshift(declarations);
      }

      declarations.declarations.unshift({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: name
        },
        init: init,
      });

      scope.declared[name] = true;
    }

    return _.find(declarations.declarations,
                  function(d) { return d.id.name === name; }).id;
  },
  // Safely allocates an unused temporary variable
  allocVar: function(name, scope) {
    scope.used = scope.used || {};

    var idName = name, index = 2;
    // need an unused variable, keep appending an incremented index
    // until a unused name is found
    while (scope.used[idName])
      idName = name + index++;
    
    scope.used[idName] = true;

    return this.ensureVar(idName, scope);
  },
  // Free a temporary variable for reuse
  freeVar: function (name, scope) {
    if (scope.used)
      delete scope.used[name];
  }

});


function transformAst(ast, options) {
  var context = new WalkContext(ast, options);
  traverse(ast, {
    pre: function(node) {
      var rv;
      if (node.type in transformations && transformations[node.type].pre) {
        rv = transformations[node.type].pre.apply(context, arguments);
      }
      context.path.push(node);
      return rv;
    },
    post: function(node) {
      var rv;
      context.path.pop();
      if (node.type in transformations && transformations[node.type].post) {
        rv = transformations[node.type].post.apply(context, arguments);
      }
      return rv;
    }
  });
}


function transform(source) {
  var ast = esprima.parse(source, {
    loc: true, range: true, comment: true, tokens: true
  });
  transformAst(ast);
  return escodegen.generate(ast, {indent: '  '});
}


exports.transformAst = transformAst;
exports.transform = transform;
