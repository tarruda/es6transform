var a, b, c;

[a, b, c] = [1, 2, 3];

run({
  'Destructuring patterns': {
    'assignment': () => expect([a, b, c]).to.eql([1, 2, 3]),
  }
});
