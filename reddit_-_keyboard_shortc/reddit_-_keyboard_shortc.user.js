// ==UserScript==
// @name           Reddit - Keyboard shortcut goodness!
// @namespace      arvid.jakobsson@gmail.com
// @include        http://www.reddit.com/*
// ==/UserScript==

var reddit = {
  comments: {
    next: function() {},
    prev: function() {},
    left: function() {},
    right: function() {}
  }
};
debugWrap(reddit.comments, 'reddit.comments');

var keyboardGoodness = {
  pages: {
    'comments': {
      /*
       http://www.reddit.com/r/subreddit/comments/id/title/
       */
      path_regexp: /\/r\/.*\/comments\/.*/,
      keys: {
	'j': reddit.comments.next,
	'k': reddit.comments.prev,
	'l': reddit.comments.left,
	'h': reddit.comments.right
      }
    }
  },

  init: function() {
    var pages = this.pages;
    for (pname in pages) {
      var page = pages[pname];
      if (location.pathname.match(page.path_regexp)) {
	var keys = page.keys;
	window.addEventListener('keyup', curry(this.keyHandler, this, keys), false);
      }
    }
  },

  keyHandler: function(keys, ev) {
    var keypressed = String.fromCharCode(ev.keyCode);
    for (var key in keys) {
      var keyfunc = keys[key];
      if (keypressed.toLowerCase() == key.toLowerCase()) {
	keyfunc();
      }
    }
  }
};


try {
  debugWrap(keyboardGoodness, 'keyboardGoodness');
  keyboardGoodness.init();
}
catch (e) {
  console.log("Error e: " + e);
}

/*
 *  My standard library
 */
function dir(obj) {
  ret = "";
  for (var propname in obj) {
    prop = obj[propname];
    if (prop)
      ret += propname + ": " + prop + "\n";
  }
  return ret;
}

function wrap(obj, pre, post) {
  function createWrapper(_obj, _methodname, _pre, _post) {
    var _method = _obj[_methodname];
    return function() {
      var args = pre(_obj, _methodname, arguments) || arguments;
      return post(
	_obj,
	_methodname,
	args,
	_method.apply(_obj, args));
    };
  }

  for (var propname in obj) {
    var property  = obj[propname];
    if (typeof property == 'function') {
//      console.log("wrapping " + propname);
      obj['_' + propname] = property;
      obj[propname] = createWrapper(obj, propname, pre, post);
    }
  }

}

function debugWrap(obj, prefix) {
  var _prefix = prefix ? prefix : "debug";
  wrap(obj,
       function(obj, methodname, arg) {
//	 console.log("PRE");
	 console.log(sprintf("> \f.\f", _prefix, methodname));
       },
       function(obj, methodname, arg, ret) {
//	 console.log("POST");
	 console.log(sprintf("< \f.\f", _prefix, methodname));
	 console.log("returns " + (ret === undefined ? "nothing" : ret));
	 return ret;
       });
}

function style(n, style) {
  if (style.constructor == String) {
    return n.style[style];
  }
  else if (style.constructor == Object) {
    for (var prop in style)
      n.style[prop] = style[prop];
    return n;
  }
  return null;
}

function create(nn, attr, p) {
  var n = document.createElement(nn);
  for (a in attr)
    n.setAttribute(a, attr[a]);
  if (p) p.appendChild(n);
  return n;
}

function log() {
  if (console)
    console.log.apply(this, arguments);
  else if (GM_log)
    GM_log($A(arguments).join(""));
}

fireEvent = function fireEvent(node, type) {
  var evt = document.createEvent("Event");
  evt.initEvent(type, true, false); // bubble, don't be cancelable
  node.dispatchEvent(evt);
};

var tictac = {
  now: function () {
    return new Date();
  },
  tic: function() {
    this.times = this.times || [];
    return this.times.push(new Date());
  },
  tac: function() {
    this.times = this.times || [];
    return this.now() - this.times.pop();
  }
};

function profile(obj){
  var tictac = {
    now: function () {
      return new Date();
    },
    tic: function() {
      this.times = this.times || [];
      return this.times.push(new Date());
    },
    tac: function() {
      this.times = this.times || [];
      return this.now() - this.times.pop();
    }
  };

  for (var prop in obj) {
    if (obj[prop].constructor == Function) {
      console.log("adding profiling for " + prop);
      obj["_" + prop] = obj[prop];
      obj[prop] = (function(prop) {
		     return function () {
		       console.log("profiling " + prop);
		       tictac.tic();
		       console.log($A(arguments).join(", "));
		       obj["_" + prop].apply(obj, arguments);
		       console.log(prop + ": " + tictac.tac() + " ms");
		     };
		   })(prop);
    }
  }
  return obj;
}

function parseRelDate(relDateStr) {
  var dateParts = relDateStr.replace("ago", "").trim().split(","), now = (new Date());
  for (var i = 0; i < dateParts.length; i++) {
    var m = dateParts[i].trim().split(/\W+/);
    var value = m[0], unit = m[1];
    if (unit.match(/weeks?/)) {
      now.setDate(now.getDate() - value*7);
    }
    else if (unit.match(/days?/)) {
      now.setDate(now.getDate() - value);
    }
    else if (unit.match(/hours?/)) {
      now.setHours(now.getHours() - value);
    }
    else if (unit.match(/minutes?/)) {
      now.setMinutes(now.getMinutes() - value);
    }
  }
  return now;
}



function parseIntSort(a,b,asc) {
  return sortf(parseInt(a,10), parseInt(b,10), asc);
}

function sortf(a, b, asc) {
  if (asc)
    return (a-b);
  else
    return -sortf(a,b, true);
}

function sortstr(a, b, asc) {
  if (asc)
    return (a > b) ? 1 : -1;
  else
    return !sortf(a, b, true);
}

function dateSort(a, b, asc) { return sortf(parseRelDate(a), parseRelDate(b), asc); };

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

function deserialize(name, def) {
	return eval(GM_getValue(name, def) );
}

function serialize(name, val) {
	GM_setValue(name, uneval(val));
}
