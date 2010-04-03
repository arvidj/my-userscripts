// ==UserScript==
// @name           Twitter - inline replies
// @namespace      arvid.jakobsson@gmail.com
// @include        http://twitter.com/
// ==/UserScript==

// how to handle threading?

var twitterInlineReplies = {
  init: function() {
    this.getReplyLinks().forEach(addHook);
  },

  // returns all reply-links
  // maybe should return every tweet that is an reply
  getReplyLinks: function() {
    // TODO: return a set of links (as nodes)
    return $x("//span[@class='meta entry-meta']/a[contains(text(),'in reply')]");
  },

  // adds the event handler to each reply link
  addHook: function(tweetNode, linkNode) {
    // TODO: give the link an event handler

    var eh = curry(this, this.loadReply, tweetNode, linkNode);
    link.addEventHandler('click', eh, false);
  },


  // loads the reply link
  loadReply: function(tweetNode, linkNode) {
    // GM_xmlHttpRequest(..., onLoad: function() { insertReply(parseReply); }, ...);
    GM_xmlhttpRequest(
      {
        method: 'GET',
        url: 'http://greaseblog.blogspot.com/atom.xml',
        headers: {
          'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
          'Accept': 'application/atom+xml,application/xml,text/xml',
        },
        onload: function(responseDetails) {
          console.log('Request for Atom feed returned ' + responseDetails.status +
                ' ' + responseDetails.statusText + '\n\n' +
                'Feed data:\n' + responseDetails.responseText);
        },
        onerror: function(responseDetails) {
          console.log('Request for Atom feed returned ' + responseDetails.status +
                ' ' + responseDetails.statusText + '\n\n' +
                'Feed data:\n' + responseDetails.responseText);
        }
      }
    );
  },

  // inserts the tweet-reply at the appropriate place
  insertReply: function(tweetNode) {

  },

  // returns the actual tweet-reply
  parseReply: function(doc, tweetNode) {

  }
};

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