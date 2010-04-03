// ==UserScript==
// @name           goyada autofiller
// @namespace      arvid.jakobsson@gmail.com
// @include        http://www.goyada.se/fuel/start.cmd?site=59
// ==/UserScript==

var startUrl = 'http://www.goyada.se/fuel/start.cmd?site=59';

// Phone no
var nr = 'secret';
var orderForm = $xs("//form[@class='form']");
onPage(startUrl, curry(fillForm, this, orderForm, {
                         'userPhone': nr,
                         'saveCookie': 'true',
                         'repeat.adress.phoneNumber': nr,
                         'supplierid': '1',
                         'offeringId': '3'
                       }));

function onPage(url, cb) {
  if (url.constructor == String) {
    if (location.href == url) {
      cb();
    }
  } else if (url.constructor == RegExp) {
    if (location.href.match(url)) {
      cb();
    }
  }
}

function fillForm(form, values) {
  function manipulateInput(input, value) {
    var tag = input.tagName;
    if (tag == 'INPUT') {
      var t = input.getAttribute('type');
      if (t == 'hidden' || t == 'password' || t == undefined) {
        input.setAttribute('value', value);
      } else if (t == 'checkbox') {
        var state = value == true ||
                      value == 'true' ||
                      value == 'on' ||
                      value == 'checked';

        input.checked = state;
      }
    } else if (tag == 'SELECT') {
      input.setAttribute('value', value);
    }
  }

  var els = $A(form.elements);
  for (key in values) {
    els.filter(function (e) { return e.getAttribute('name') == key; })
      .forEach(function (e) { manipulateInput(e , values[key]); });
  }
}


/*
 * STD - functions
 */
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

// funkar om n != <html>
function remove(n) { n.parentNode.removeChild(n); }