var _ = require('lodash');
var klass = require('klass');
var esprima = require('esprima');
var escodegen = require('escodegen');
var escope = require('escope');
var replace = require('estraverse').replace;


var transformations = {
  // Transform ArrowFunctionExpression nodes into FunctionExpression nodes
  ArrowFunctionExpression: require('./arrow_functions'),
  ThisExpression: require('./this'),
};

var WalkContext = klass({
  initialize: function(ast, options) {
    this.options = options;
    this.scope = escope.analyze(ast);
    this.scope.attach();
    this.path = [];
    this.arrowThis = this.unused('_this');
    this.forOfIndex = this.unused('_i');
    this.forOfLength = this.unused('_l');
    this.forOfTemp = this.unused('_a');
    this.destructureTemp = this.unused('_tmp');
  },
  // Finds an identifier name derived from the requested that is not used
  // in the program code for safely usage when translating ast nodes
  unused: function(requested) {
    var name = requested;
    var idx = 2;

    for (var i = 0, l = this.scope.scopes.length; i < l; i++) {
      var s = this.scope.scopes[i];
      while (s.isUsedName(name)) {
        name = requested + idx++;
      }
    }

    return name;
  },
  // Find the closest parent that belongs to one of the types
  closest: function(types) {
    return _.findLast(this.path, function(p) { 
      return _.contains(types, p.type);
    });
  },
  currentScope: function() {
    return this.scope.acquire(this.closest([
      'Program',
      'FunctionExpression',
      'FunctionStatement',
      'ArrowFunctionExpression'
    ]));
  },
  ensureVar: function(name, scope, init) {
    var body = 
      scope.type === 'global' ?
      scope.block.body :
      scope.block.body.body;

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
  freeVar: function (name) {
    var scope = this.currentScope();

    if (scope.used)
      delete scope.used[name];
  }

});


function transformAst(ast, options) {
  var context = new WalkContext(ast, options);
  return replace(ast, {
    enter: function(node) {
      var rv;
      if (node.type in transformations && transformations[node.type].enter) {
        rv = transformations[node.type].enter.apply(context, arguments);
      }
      context.path.push(node);
      return rv;
    },
    leave: function(node) {
      var rv;
      context.path.pop();
      if (node.type in transformations && transformations[node.type].leave) {
        rv = transformations[node.type].leave.apply(context, arguments);
      }
      return rv;
    }
  });
}


function transform(source) {
  var ast = esprima.parse(source, {
    loc: true, range: true, comment: true, tokens: true
  });
  ast = transformAst(ast);
  return escodegen.generate(ast, {indent: '  '});
}


exports.transformAst = transformAst;
exports.transform = transform;
