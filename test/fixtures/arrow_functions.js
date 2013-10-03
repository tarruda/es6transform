var factorial = n => n > 1 ? n * factorial(n - 1) : 1;

var fibonnaci = (function() {
  var cache = [0, 1];
  return (n) => {
    if (n >= cache.length) cache[n] = fibonnaci(n - 1) + fibonnaci(n - 2);
    return cache[n];
  };
})();

var obj = {
  method: function() {
    var arrow = () => {
      var subArrow = () => this;
      var notArrow = function() { return this; };
      return [subArrow(), notArrow()];
    };
    return arrow();
  }
};


run({
  'Arrow functions': {
    'expression': () => expect(factorial(5)).to.eql(120),
    'block': () => expect(fibonnaci(20)).to.eql(6765),
    'lexical context': () => {
      var items = obj.method();
      expect(items[0]).to.eq(obj);
      expect(items[1]).to.not.eq(obj);
    }
  }
});
