var assign = require('./destructure');


exports.pre = function(node, parent, prop) {
  var to = node.left, from = node.right;
  var type = to.type;

  if (type === 'ObjectPattern' || type === 'ObjectExpression' ||
      type === 'ArrayPattern' || type === 'ArrayExpression') {
    var seq = [];
    assign.call(this, to, from, node.operator, this.currentScope(), seq);
    parent[prop] = {
      type: 'SequenceExpression',
      expressions: seq,
      loc: {
        start: {
          line: to.loc.start.line,
          column: to.loc.start.column
        },
        end: {
          line: from.loc.end.line,
          column: from.loc.end.column
        }
      },
      range: [
        to.range[0],
        from.range[1]
      ]
    };
  }
};
