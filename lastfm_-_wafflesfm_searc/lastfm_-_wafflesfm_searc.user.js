// ==UserScript==
// @name           Last.fm - Waffles.fm search current artist in radio
// @namespace      arvid.jakobsson@gmail.com
// @description    Waffle search current artist in radio
// @include        http://www.last.fm/listen/*
// ==/UserScript==

var LastFmRadio = {
  init: function() {
    this._createDownloadLink();
    this._parser = new DOMParser();
  },

  _createDownloadLink: function() {
    var link = create('a', {href: '#', id: "wafflesDownloadLink"}, document.body);
    var img = create('img', {src: "https://www.waffles.fm/favicon.ico"}, link);
    link.addEventListener('click', bind(this._onDownloadClick, this), false);

    GM_addStyle('#wafflesDownloadLink {' +
		' position: fixed;' +
		' right: 0px;' +
		' top: 0px;' +
		  ' padding: 5px; ' +
		'}' +
		'#wafflesDownloadLink img {' +
		' width: 40px;' +
//		' height: 40px;' +
		'}'
	       );
  },

  _onDownloadClick: function(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    var currentTrack = unsafeWindow.LFM.Flash.Player.context.currentTrack;
    if (currentTrack) {
      var artist = currentTrack.creator;
      var track = currentTrack.name;
      this._getTrackInfo(artist, track, bind(this._openWafflesLink, this));
    }
  },

  _openWafflesLink: function(response) {
    var xmldoc = this._parser.parseFromString(response.responseText, 'application/xml');

    var album_node = $xs("//album", xmldoc);
    var artist = $xs("./artist", album_node).textContent;
    var album = $xs("./title", album_node).textContent;

    if (artist && album) {
      var waffles_url = sprintf("https://www.waffles.fm/browse.php?q=\f+\f+mp3&c=0&s=seeders&d=desc#simple", artist, album);
      GM_openInTab(waffles_url);
    }
  },

  _getTrackInfo: function(artist, track, onload) {
    var api_key = '4c841aeafc6c76d18a4bc2dc0ac13c52';

    var url = sprintf('http://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=\f&artist=\f&track=\f',
		      encodeURI(api_key),
		      encodeURI(artist),
		      encodeURI(track));

    GM_xmlhttpRequest({
			url:url,
			method: "GET",
			onload: onload || function () {}
		      });
  }

};

window.addEventListener('load', function() {
			  try {
			    LastFmRadio.init();
			  }
			  catch (e) {
			    log(e);
			  }
			}, false);

/*
wrap(function(fn, ctx) {
       log("wrap on");
       fn.apply(ctx, arguments);
       log("wrap off");
     },
*/
/*
 *  My standard library :)
 */

function wrap(wrapper, towrap, ctx) {

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

