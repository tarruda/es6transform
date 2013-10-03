var factorial = n => n > 1 ? n * factorial(n - 1) : 1;

var fibonnaci = () => {
  var cache = [0, 1];
  return (n) => {
    if (n >= cache.length) cache[n] = fibonnaci(n - 1) + fibonnaci(n - 2);
    return cache[n];
  };
};
fibonnaci = fibonnaci();

var obj = {
  method: function() {
    var arrow = () => {
      return this;
    };
    return arrow();
  }
};


run({
  'Arrow functions': {
    'expression': () => expect(factorial(5)).to.eql(120),
    'block': () => expect(fibonnaci(20)).to.eql(6765),
    'lexical context': () => expect(obj.method()).to.eq(obj)
  }
});
