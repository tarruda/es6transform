var a, b, c;

[a, b, c] = [1, 2, 3];

var [d, e, f] = [4, 5, 6];

var j, k, l;
var {g, h, i} = {g: 7, h: 8, i: 9};


run({
  'Destructuring patterns': {
    'array assignment': () => expect([a, b, c]).to.eql([1, 2, 3]),
    'array declaration': () => expect([d, e, f]).to.eql([4, 5, 6]),
    'object declaration': () => expect([g, h, i]).to.eql([7, 8, 9]),
  }
});
