function assign(to, from, operator, scope, sequence) {
  if (to.type === 'Identifier') {
    sequence.push({
      type: 'AssignmentExpression',
      operator: operator,
      left: to,
      right: from
    });
    return sequence;
  }
  var tmp, i, l;
  if (from.type === 'Identifier') {
    tmp = from;
  } else {
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
    var props = to.properties;
    for (i = 0, l = props.length; i < l; i++) {
      var prop = props[i];
      from = {
        type: 'MemberExpression',
        object: tmp,
        property: prop.key,
        computed: prop.key.type === 'Keyword' || prop.key.type === 'Reserved' || prop.key.type === 'Literal'
      };
      to = prop.value || prop.key;
      assign.call(this, to, from, operator, scope, sequence);
    }
  }
  this.freeVar(tmp.name, scope);
  return sequence;
}
module.exports = assign;