var factorial = n => n > 1 ? n * factorial(n - 1) : 1;


run({
  'Arrow functions': {
    'expression': () => expect(factorial(5)).to.eql(120)
  }
});
