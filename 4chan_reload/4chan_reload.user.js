// ==UserScript==
// @name           4chan reload
// @namespace      arvid.jakobsson@gmail.com
// @include        http://img.4chan.org/b/*
// ==/UserScript==

/*
  threads = [thread]
  thread = { topic, url, posts }
  posts = [post]
  post = { img, posterName, text, date, scrollX,Y, imgName, postNo, url, repliesTo }
  repliesTo = nr / url?
*/

modelFourChan = function () {};
modelFourChan.prototype = {
 PAGETYPE: {FORUM: 0, THREAD: 1, FOUROHFOUR: 2},
 threads: [],

 findPageType: function() {
    if (!this.pageType) {
      if (location.href.match(/4chan\.org\/(.*?)\/res/)) {
        this.pageType = this.PAGETYPE.THREAD;
        console.log("pagetype: thread");
      } else {
        this.pageType = this.PAGETYPE.FORUM;
        console.log("pagetype: forum");
      }
    }
    return this.pageType;
  },

 getThreads: function() {
    if (!this.threads) this.updateThreads();
    return threads;
  },

 updateThreads: function() {
    if (this.findPageType() == this.PAGETYPE.FORUM) {
      threads = undefined; //TODO
    } else {
      var posts = $x("//td[@class='reply']");

      var opImgNode = $xs("//form[@name='delform']/a/img")
      var opImg = {
       node: opImgNode,
       th: opImgNode.getAttribute('src'),
       fs: opImgNode.parentNode.getAttribute('href')
      };

      var op = {
       posterName: $xs("//*[@class='postername']").textContent,
       img: opImg,
       text: $xs("//form[@name='delform']/blockqoute").textContent,
      };

      var threadUrl = location.href.match(/(.*?)#.*$/)[1];

      var replies = posts.map(function (replyNode) {
          var replyImg = false, imgNode = $xs(".//a/img", replyNode);
          if (imgNode) {
            replyImg = { node: imgNode,
                         th: imgNode.getAttribute('src'),
                         fs: imgNode.parentNode.getAttribute('href')
            };
          }

          var replyPostNo = $xs(".//span[starts-with(@id, 'norep']")
            .getAttribute(id).match(/norep(.*)/)[1];

          var reply = {
           text: $xs(".//blockquote", replyNode).textContent,
           img: replyImg,
           posterName: $xs(".//*[@class='commentpostername']", replyNode).textContent,
           offsetTop: getOffsetTop(replyNode),
           imgName: $xs(".//span[@class='filesize']/a").textContent,
           postNo: replyPostNo,
           url: threadUrl + "#" + replyPostNo
          };
          return reply;
        });

      var thread = {
       topic: "",
       url: threadUrl,
       posts: cons(op, replies)
      };
    }
  }
};

//constructor
fourChanHelper = function() {
    console.log("init fourChanHelper");

    this.mdl = new modelFourChan();
    console.log(this.mdl.findPageType);

    this.plantKeyBindings();
};

fourChanHelper.prototype = {
  /*
   * Key handling stuff
   */

 plantKeyBindings: function () {
    var that = this;

    this.keybindings = {
      "C-M-r": that.reload,
      "C-M-j": that.next,
      "C-M-y": that.prev,
      "C-M-i": that.imageOverlay
    };

    window.addEventListener('keypress', bind(this.keyHandler, this), false);
  },

 keyHandler: function(ev) {
    var str = this.eventToKeyString(ev);
    if (str) {
      console.log("key pressed: " + str);
      for (keyStr in this.keybindings) {
        if (str == keyStr) {
          this.keybindings[str]();
        }
      }
    }
  },

 /*
  * Turns a keypress javascript event into a emacs style
  * key description such as "C-M-s" (ctrl-meta-s)
  */
 eventToKeyString: function(ev) {
    if (ev.isChar) {
      return false; // ""?
    } else {
      var key = String.fromCharCode(ev.charCode);
      var ctrl = ev.ctrlKey;
      var alt = ev.altKey;
      return (ctrl ? "C-" : "") + (alt ? "M-" : "") + key;
    }
  },

 /*
  * 4chan stuff
  */
 reload: function() {
    console.log("reload");
    var pt = this.mdl.getPageType();
    if (pt == mdl.pageType.THREAD) {
      // hitta sista posten, ladda om sidan
      var thr = mdl.getThreads();
      location.replace(last(first(thr.threads)).url);
      location.reload();
    } else if (pt == mdl.pageType.FORUM) {
      // gå till första tråden, ladda om sidan
      window.scrollX = 0;
      location.reload();
    }
  },
 next: function() {console.log("next");},
 prev: function() {console.log("prev");},
 imageOverlay: function() {console.log("imageOverlay");}
};

new fourChanHelper();

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

function last(ar) {
  return ar[ar.length - 1];
}

function cons(h, tail) {
  return Array.concat([h], tail);
}

function getOffsetTop(node) {
  var offs = node.offsetHeight;
  if (node.offsetParent != undefined) {
    return offs + getOffsetTop(node.offsetParent);
  }  else {
    return offs;
  }
}


