/*
 * Random boilerplate, and jsQuickCheck-stuff
 */
var propContains = {args: [randomString], prop: function (rs) { return true; }};
function randomString(s) {
  // map (toChar . (const $ randomInt 0 255) ) range(0, s)
  return range(0, s)
    .map(function (x) { return randomInt(0, 255); })
    .map(String.fromCharCode);

}


/*
 * Returns the list of values between min, max using step
 */
function range(min, max, step) {
  var r = [];
  for (var i = min; i <= max; i += step) { r.push(i); }
  return r;
}

// what properties can we deduce about range?
// var propRange = {args: [randomInt, randomInt, randomInt], prop: function (min, max, step) {

/*
 * Return a random integer between 0 and s, it may not be randomly
 * distributed.
 */
function randomIntImprecise(s) {
  return Math.round(Math.random()*s);
}

/*
 * Return a random integer between min and max. The distribution
 * should be even.
 */
function randomInt(min, max) {
  var r = Math.random();
  var i = max - min + 0.5;
  var q = r * i + (min - 0.5);

  return Math.round(q);
}

/*
 * Some properties on randomInt
 */
var propRandomInt = [
  {
    args: [randomIntImprecise, randomIntImprecise],
    prop: function (min, max) {
      return min <= randomInt(min, max) && max >= randomInt(min, max);
    }
  },
  {
    args: [randomIntImprecise] ,
    prop: function (x) {
      return x = randomInt(x, x);
    }
  }
];

// test: randomInt faktiskt retunerar värden mellan min och max
// test: randomInt returnerar min
// test: eller max ibland (ganska otroligt
// test: randomInt(x,x) = x (borde funka)
/*
  randomInt(0, 4)
  i = (4 - 0 + 0.5) = 4.5
  q = r * 4.5 + (0 - 0.5) = 4.5r - 0.5 = [-0.5, 4]
  round(q) = [0, 4]

  randomInt(1, 5)
  i = (5 - 1 + 0.5) = 4.5
  q = r * 4.5 + (1 - 0.5) = 4.5r + 0.5 = [0.5, 5]
  round(q) = [0.5, 5]
*/