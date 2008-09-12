// ==UserScript==
// @name			Reddit - open comments and article in new tabs
// @namespace		http://arvixx.blogspot.com
// @description	Adds a new button to each article that opens the comments and article in new tabs
// @include		http://reddit.com/*
// @include		http://*.reddit.com/*
// ==/UserScript==

/* http://www.gnu.org/copyleft/gpl.html */
var redditArticleAndCommentsInNewTabs = {
  /*
  mode: 0,
  MODE: {
    ALWAYS: 0,
    ONLY_IF_COMMENTS: 1,
    DONT_SHOW: 2
  },
   0 = always open link and comments.
   1 = open link but only open comments if there are any comments.
   2 = don't show the link if there are no comments
   */
  debug: false,
  log: function() {
    if (this.debug) console.log(arguments);
  },

  createButton: function(label, action) {
    var liitem = create('li');
    var bylink = create('a', {'href': '#', 'class': 'bylink'}, liitem);
    bylink.textContent = label;
    bylink.addEventListener('click', action, true);
    return liitem;
  },

  init: function() {
    var articles = $x("//div[starts-with(@id, 'thingrow_')]");
    this.log("found " + articles.length + " articles");;
    articles.forEach(bind(this.addLink, this));
  },

  stopEv: function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  },

  addLink: function(article) {
    var articlelink = $xs(".//a[starts-with(@id, 'title_')]", article);
    var commentslink = $xs(".//a[starts-with(@id, 'comment_t3_')]", article);
    var buttonlist = $xs(".//ul[@class='flat-list buttons']", article);

    if (articlelink && commentslink) {
      var ncomments = commentslink.textContent.match(/\d+ comment/);
      var that = this;
      var f = function (ev) {
	that.stopEv(ev);
	GM_openInTab(commentslink);
	GM_openInTab(articlelink);
      };
      var lbl = 'comments & article';
      buttonlist.appendChild(this.createButton(lbl, f));
    }
  }
};

/*
wrap(redditArticleAndCommentsInNewTabs, function(obj, methodname, arg) {
       console.log("> redditArticleAndCommentsInNewTabs." + methodname);
     },
     function(obj, methodname, arg, ret) {
       console.log("< redditArticleAndCommentsInNewTabs." + methodname);
       console.log("returns " + ret);
       return ret;
     });
*/
redditArticleAndCommentsInNewTabs.init();

/*
 *  My standard library
 */

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
      console.log("wrapping " + propname);
      obj['_' + propname] = property;
      obj[propname] = createWrapper(obj, propname, pre, post);
    }
  }

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
