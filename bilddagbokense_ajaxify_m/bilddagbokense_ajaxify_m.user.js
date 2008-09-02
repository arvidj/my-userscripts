// ==UserScript==
// @name			Bilddagboken.se, ajaxify "mark as seen"
// @namespace		arvid.jakobsson@gmail.com
// @include		http://*.bilddagboken.se/p/friends.html*
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js
// ==/UserScript==

var BDAjaxifyMarkAsSeen = {
  loadingimgurl: 'http://static2.bilddagboken.se/img/loading.gif',

  init: function() {
    //console.log('BDAjaxifyMarkAsSeen.init');

    this.ajaxifyMarkFriend();
    this.ajaxifyMarkAll();
  },

  ajaxifyMarkFriend: function() {
    //console.log('ajaxifyMarkFriend');
    var that = this, markLinks = $x("//div[@class='friend']//a[contains(@href, 'action=clearNewImagesFromFriend')]");
    markLinks.forEach(function (markLink) {
			var orgsrc = $(markLink.firstChild).attr('src');
			new Ajaxifier(markLink, {
					setsrc: function (l, src) {
					  $(l.firstChild).attr('src', src);
					},
					oninit: function (markLink) {
					  this.inittime = now();
					  this.setsrc(markLink, that.loadingimgurl);
					},
					onload: function (rd, markLink) {
/*					  var diff;
					  var that2 = this;
					  if ((diff = now() - this.inittime) < 2000) {
					    console.log("diff: " + (2000 - diff));
					    window.setTimeout(function() {
								that2.setsrc(markLink, orgsrc);
								that.cleanrow($xs("./ancestor::div[@class='friend']/div[@class='usr']", markLink));
							      }, 2000 - diff);
					  }*/
					  this.setsrc(markLink, orgsrc);
					  that.cleanrow($xs("./ancestor::div[@class='friend']/div[@class='usr']", markLink));
					},
					onerror: function (rd, markLink) {
					  this.setsrc(marklink, orgsrc);
					}
				      });
		      });
  },

  ajaxifyMarkAll: function() {
    var markAll = $xs("//a[contains(@href, '?action=clearNewImages')]"),
    li = this.ajaxifyMarkAll.loadingimg = create('img', {src: this.loadingimgurl, height: 16, width: 16});
    $(li).css('display', 'none');

    that = this;
    markAll.parentNode.insertBefore(li, markAll.nextSibling);
    new Ajaxifier(markAll, {
		    toggle: function () {
		      var current = $(li).css('display');
		      if (current == 'inline')
			$(li).css('display', 'none');
		      else
			$(li).css('display', 'inline');
		    },
		    oninit: function (l) {
		      this.toggle();
		    },
		    onload: function (l, rd) {
		      $x("id('content')//div[@class='friend']/div[@class='usr']")
			.forEach(that.cleanrow);
		      this.toggle();
		    },
		    onerror: function (l, rd) {
		      this.toggle();
		    }
		  });
  },

  cleanrow: function(row) {
    var n, b;
    if (n = $xs("./span[contains(@class, 'newImagesForFriend')]", row))
      n.parentNode.removeChild(n);
    if ((b = $xs("./a/b", row)))
      b.parentNode.textContent = b.firstChild.textContent;
  }
};

function Ajaxifier(link, opt) {
  this.link = link;
  this.opt = opt;

  link.addEventListener('click', bind(this.ajaxclick, this), true);
}

Ajaxifier.prototype.ajaxclick = function (e) {
  e.stopPropagation();
  e.preventDefault();

  var that = this;
  if (this.inprogress == undefined || this.inprogress == false) {
    this.inprogress = true;
    var search = $(this.link).attr('href');

    this.opt.oninit(this.link);
    if (this.opt.simulate) {
      console.log('simulate');
      this.inprogress = false;
      this.opt.onload({}, this.link)
    }
    else {
      xhr({
	    url: search,
	    onload: function(rd) {
	      console.log('onload');
	      that.inprogress = false;
	      that.opt.onload(rd, that.link);
	    },
	    onerror: function(rd) {
	      console.log('onerror');
	      that.inprogress = false;
	      that.opt.onerror(rd, that.link);
	    }
	  });
    }
  }
  else {
    //alert('in progress!');
  }
}

function now(){
  return (new Date());
}

function create(n, attrs) {
  var nn = document.createElement(n);
  $(nn).attr(attrs ? attrs : {});
  return nn;
}

function $x(xpath, root) { // From Johan Sundström
  try {
    var doc = root ? root.evaluate ? root : root.ownerDocument : document, next;
    var got = doc.evaluate(xpath, root||doc, null, null, null), result = [];
    while(next = got.iterateNext())
      result.push(next);
    return result;
  }
  catch (e) {
    console.log(xpath); throw e;
  }
}

function $xs(xpath, root) {
  return $x(xpath, root)[0];
}

function bind(method, obj) {
  return function() { return method.apply(obj, arguments); }
}

function xhr(opts) {
  console.log('xhr: ' + opts.url);
  var ret = new XMLHttpRequest();
  ret.open(opts.method || 'GET', opts.url, opts.async || true);
  ret.onload = opts.onload || function() {};
  ret.onerror = opts.onerror || function() {};
  ret.send(opts.method && opts.method == 'POST' ? opts.data || '' : null);
  return ret;
}

BDAjaxifyMarkAsSeen.init();
