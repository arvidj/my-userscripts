// ==UserScript==
// @name           studentportalen
// @namespace      arvid.jakobsson@gmail.com
// @include        http://www.student.chalmers.se/sp/course?course_id=*
// ==/UserScript==



var name = $xs("//font[@class='h3']").textContent;
document.title = "Kurs - " + name;


// ------------------------------------------------------------------------------

function create(nn, attr, p) {
  var n = document.createElement(nn);
  for (a in attr)
    n.setAttribute(a, attr[a]);
  if (p) p.appendChild(n);
  return n;
}

function deserialize(name, def) {
	return eval(GM_getValue(name, def) );
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
String.prototype.trim = function() { return this.replace(/^\W+|\W+$/gi, ""); };

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