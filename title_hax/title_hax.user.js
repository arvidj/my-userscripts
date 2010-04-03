// ==UserScript==
// @name           title hax
// @namespace      arvid.jakobsson@gmail.com
// @include        *
// ==/UserScript==

var helpers = {
 transpose: function (t, sep) {
    var spl = t.split(sep);
    return (spl.splice(1).join(sep) + sep + spl);
  }
};

var hax = [
	   { url_regex: /http:\/\/news\.ycombinator\.com\/item.*/,
	     title: function (title) {
	       return helpers.transpose(title, " | ");
	     }
	   },
	   { url_regex: /http:\/\/bbs\.archlinux\.org\/view(forum|topic)\.php\?p?id=.*/,
	     title: function (title) {
	       return helpers.transpose(title, " / ");
	     }
	   },
	   { url_regex: /http:\/\/www\.student\.chalmers\.se\/sp\/course\?course_id=.*/,
	     title: function () {
	       return "Kurs - " + $xs("//font[@class='h3']").textContent;
	     }
	   }
	   ];

hax.forEach(function (h) {
    if (location.href.match(h.url_regex)) {
      console.log(document.title);
      if (h.title.constructor == Function) {
	console.log("new title is: " + t);
	document.title = h.title(document.title);
      }
    }
  });

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
