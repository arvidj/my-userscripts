// ==UserScript==
// @name           BDB autologin
// @namespace      arvid.jakobsson@gmail.com
// @include        http://bilddagboken.se/*
// @include        http://*.bilddagboken.se/*
// ==/UserScript==

var username = 'arvixx';
var password = 'secret';

window.addEventListener('load', function () {
	if (!loggedIn()) {
	    login(username, password, true);
	    /*
	     * hitta logout länken, bind event listener { sätt remember = false }
	     */

	}
	/* else {
	 * bind event listener { sätt remember = true }
	 * om man loggar in
	 */

    }, false);


function loggedIn() {
  return $('loginForm') == null;
}

function doRemember() {
    return true; //GM_getValue('remember', false);
}

function login(user, pass, enc) {
  var lgn = $('userLogin');
  var psw = $('passwordLogin');

  lgn.value = username;
  psw.value = enc ? rot13(password) : password;

  $('loginForm').submit();
}



function rot13(str) {
  var a = "a".charCodeAt(0), z = "z".charCodeAt(0);
  var aU = "A".charCodeAt(0), zU = "Z".charCodeAt(0);
  var out = [], i;
  for (i = 0; i < str.length; i++) {
    var chr = str.charCodeAt(i);
    if (chr >= a && chr <= z) {
      chr = ((chr - a + 13) % 26) + a;
    } else if (chr >= aU && chr <= zU) {
      chr = ((chr - aU + 13) % 26) + aU;
    }
    out.push(String.fromCharCode(chr));
  }
  return out.join("");
}

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
