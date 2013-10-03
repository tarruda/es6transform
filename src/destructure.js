// Normalizes an destructuring pattern expression/statements into an array of
// simple assignments that would have similar effect
function assign(to, from, operator, scope, sequence) {
  if (to.type === 'Identifier') {
    // Target is an identifier, push a simple assignment
    sequence.push({
      type: 'AssignmentExpression',
      operator: operator,
      left: to,
      right: from
    });

    return sequence;
  }

  var tmp, i, l;

  // target is a destructuring pattern
  if (from.type === 'Identifier') {
    tmp = from;
  } else {
    // need to save the source into a temporary variable
    tmp = this.allocVar(this.tmp, scope);
    sequence.push({
      type: 'AssignmentExpression',
      operator: '=',
      left: tmp,
      right: from
    });
  }

  if (to.type === 'ArrayExpression' || to.type === 'ArrayPattern') {
    var index = 0;
    for (i = 0, l = to.elements.length; i < l; i++) {
      var el = to.elements[i];
      if (el) {
        from = {
          type: 'MemberExpression',
          object: tmp,
          property: {
            type: 'Literal',
            value: index
          },
          computed: true
        };
        assign.call(this, el, from, operator, scope, sequence);
        index++;
      }
    }
  }

  if (to.type === 'ObjectExpression' || to.type === 'ObjectPattern') {
    for (i = 0, l = to.properties.length; i < l; i++) {
      var prop = to.properties[i];
      from = {
        type: 'MemberExpression',
        object: tmp,
        property: prop.key,
        computed: 
          prop.key.type === 'Keyword' ||
          prop.key.type === 'Reserved' ||
          prop.key.type === 'Literal'
      };
      to = prop.value || prop.key;
      assign.call(this, to, from, operator, scope, sequence);
    }
  }

  this.freeVar(tmp.name, scope);

  return sequence;
}


module.exports = assign;
