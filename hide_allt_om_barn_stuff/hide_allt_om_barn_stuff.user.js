// ==UserScript==
// @name           hide allt om barn stuff
// @namespace      arvid.jakobsson@gmail.com
// @include        http://dn.se/*
// ==/UserScript==



(function () {

   var aobXP = "//div[contains(@class, 'box') and .//a[contains(@href, 'alltombarn')]]";
   $x(aobXP).forEach(remove);

 })();

function remove(node) {
  if (!!node.parentNode) node.parentNode.removeChild(node);
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
  return function() {
    return method.apply(obj || window, curryargs.concat($A(arguments)));
  };
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
