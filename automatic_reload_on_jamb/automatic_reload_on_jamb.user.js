// ==UserScript==
// @name           Automatic reload on Jambai
// @namespace      arvid.jakobsson@gmail.com
// @include        http://inbox.jbi.in/*
// ==/UserScript==

/*
<form class="t12l_get_email_button" method="post" action="./">
 <input type="submit" value="Give me full 10 Minutes again" name="resettime"/>
</form>
*/

var time = {
  seconds: function(n) { return n * 1000; },
  minutes: function(n) { return n * this.seconds(60); },
  hours: function(n) { return n * this.minutes(60); },
  days: function(n) { return n * this.hours(24); }
};

var autoReload = {
  formXPath: "//form[@class='t12l_get_email_button' and input[@name='resettime']]",
  reloadInterval: time.minutes(3),

  init: function() {
    if (this.isInboxPage())
      window.setTimeout(bind(this.reload, this), this.reloadInterval);
  },

  reload: function() {
    this.getSubmitInput().click();
  },

  isInboxPage: function() {
    return this.getReloadForm() != null;
  },

  getReloadForm: function() {
    return $xs(this.formXPath);
  },

  getSubmitInput: function() {
    return this.getReloadForm().elements[0];
  }
};

autoReload.init();

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