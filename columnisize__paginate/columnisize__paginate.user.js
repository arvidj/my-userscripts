// ==UserScript==
// @name           Columnisize & Paginate
// @namespace      arvid.jakobsson@gmail.com
// @include        http://stevenf.tumblr.com/post/94591835/warning-a-long-rambly-exploration-of-the-state
// ==/UserScript==

/*
  1. Finn all text.
  1.1. Genom att användaren klickar
  1.2. Automatiskt, största textmassan
  Antagligen svårare än vad det låter.
  
  2. Isolera texten.
  2.1 På samma sida?
  CSS isolation, white box osv.

  3. Paginera, columnisera.
  nog ganska okey
*/

/* STD - functions */
function decimals(num, n) {
  var a = Math.pow(10, n);
  return Math.round(num*a) / a;
}

function create(nn, attr, p) {
  var n = document.createElement(nn);
  for (a in attr)
    n.setAttribute(a, attr[a]);
  if (p) p.appendChild(n);
  return n;
}

function deserialize(name, def) {
  var ev = eval(GM_getValue(name));
  return (ev != null ? ev :
    def != null ? def : null);
}

function serialize(name, val) {
  GM_setValue(name, uneval(val));
}

function $x(xpath, root) { // From Johan Sundström
  var doc = root ? root.evaluate ? root : root.ownerDocument : document, next;
  var got = doc.evaluate(xpath, root||doc, null, null, null), result = [];
  while((next = got.iterateNext())) {
	  result.push(next);
  }
  return result;
}

function $xs(xpath, root) { return $x(xpath, root)[0]; }

function trim(str) {
  return str.replace(/^\W+|\W+$/gi, "");
};

function bind(method, obj) {
  return function() {
    method.apply(obj, arguments);
  };
}

function curry(method, obj) {
  var curryargs = $A(arguments).slice(2);
  return function() { return method.apply(obj || window, curryargs.concat($A(arguments))); };
}

function $A(arr) {
  var r = [], len = arr.length;
  while (len--) r.unshift(arr[len]);
  return r;
}

function sprintf(str) {
  var a;
  args = $A(arguments);
  args.shift();
  while ((a = args.shift()) !== undefined)
    str = str.replace("\f", a);
  return str;
}

function $(id) {
  return document.getElementById(id);
}
