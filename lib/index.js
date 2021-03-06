var _ = require('lodash');
var has = require('has');
var classic = require('classic');
var esprima = require('esprima');
var escodegen = require('escodegen');
var traverse = require('ast-traverse');
var unsupported = [
    'ArrayPattern',
    'ClassBody',
    'ClassDeclaration',
    'ClassExpression',
    'ClassHeritage',
    'ExportDeclaration',
    'ExportBatchSpecifier',
    'ExportSpecifier',
    'ForOfStatement',
    'ImportDeclaration',
    'ImportSpecifier',
    'MethodDefinition',
    'ModuleDeclaration',
    'ObjectPattern',
    'SpreadElement',
    'TaggedTemplateExpression',
    'TemplateElement',
    'TemplateLiteral',
    'YieldExpression'
  ];
(function () {
  _.each(unsupported, function (item) {
    unsupported[item] = true;
  });
}());
function collectIdentifiers(ast) {
  var rv = {};
  traverse(ast, {
    pre: function (node) {
      if (node.type === 'Identifier')
        rv[node.name] = true;
    }
  });
  return rv;
}
var transformations = {
    ArrowFunctionExpression: require('./arrow_functions'),
    ThisExpression: require('./this'),
    AssignmentExpression: require('./assignment'),
    VariableDeclaration: require('./declaration')
  };
var WalkContext = classic({
    constructor: function (ast, options) {
      this.options = options;
      this.path = [];
      this.identifiers = collectIdentifiers(ast);
      this.arrowThis = this.unused('_this');
      this.forOfIndex = this.unused('_i');
      this.forOfLength = this.unused('_l');
      this.forOfTemp = this.unused('_a');
      this.tmp = this.unused('_tmp');
    },
    unused: function (requested) {
      var name = requested;
      var idx = 2;
      while (this.identifiers[name]) {
        name = requested + idx++;
      }
      return name;
    },
    closest: function (types, start) {
      return _.findLast(this.path, function (p) {
        return start !== p && _.contains(types, p.type);
      });
    },
    currentScope: function (start) {
      return this.closest([
        'Program',
        'FunctionExpression',
        'FunctionStatement',
        'ArrowFunctionExpression'
      ], start);
    },
    ensureVar: function (name, scope, init) {
      var body = scope.type === 'Program' ? scope.body : scope.body.body;
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
          init: init
        });
        scope.declared[name] = true;
      }
      return _.find(declarations.declarations, function (d) {
        return d.id.name === name;
      }).id;
    },
    allocVar: function (name, scope) {
      scope.used = scope.used || {};
      var idName = name, index = 2;
      while (scope.used[idName])
        idName = name + index++;
      scope.used[idName] = true;
      return this.ensureVar(idName, scope);
    },
    freeVar: function (name, scope) {
      if (scope.used)
        delete scope.used[name];
    }
  });
function transformAst(ast, options) {
  var context = new WalkContext(ast, options);
  traverse(ast, {
    pre: function (node) {
      var rv;
      if (has(unsupported, node.type)) {
        throw new SyntaxError(node.type + ' nodes are not supported');
      }
      if (node.type in transformations && transformations[node.type].pre) {
        rv = transformations[node.type].pre.apply(context, arguments);
      }
      context.path.push(node);
      return rv;
    },
    post: function (node) {
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
  var ast = esprima.parse(source, { loc: true });
  transformAst(ast);
  return escodegen.generate(ast, { indent: '  ' });
}
exports.transformAst = transformAst;
exports.transform = transform;