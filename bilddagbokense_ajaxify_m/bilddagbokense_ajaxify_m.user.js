// ==UserScript==
// @name			Bilddagboken.se, ajaxify "mark as seen"
// @namespace		arvid.jakobsson@gmail.com
// @include		http://*.bilddagboken.se/p/friends.html*
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js
// ==/UserScript==

console.log('init');

var BDAjaxifyMarkAsSeen = {
	loadingimgurl: 'http://static2.bilddagboken.se/img/loading.gif',
	
	init: function() {
		console.log('BDAjaxifyMarkAsSeen.init');
		var that = this;
		
		this.ajaxifyMarkFriend();
		this.ajaxifyMarkAll();
	},
	
	ajaxifyMarkFriend: function() {
		console.log('ajaxifyMarkFriend');
		var that = this, markLinks = $x("//div[@class='friend']//a[contains(@href, 'action=clearNewImagesFromFriend')]");
		markLinks.forEach(function (markLink) {
			var orgsrc = $(markLink.firstChild).attr('src');
			new Ajaxifier(markLink, {
				setsrc: function (l, src) {
					$(l.firstChild).attr('src', src);
				},
				oninit: function (markLink) {	
					this.setsrc(markLink, that.loadingimgurl);
				},
				onload: function (rd, markLink) {
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
		console.log('ajaxifyMarkAll');
		var markAll = $xs("//a[contains(@href, '?action=clearNewImages')]"), 
			li = this.ajaxifyMarkAll.loadingimg = create('img', {src: this.loadingimgurl, height: '11px'}),
			that = this;
		
		markAll.parentNode.insertBefore(li, markAll.nextSibling);
		
		new Ajaxifier(markAll, {
			oninit: function (l) {
				$(li).toggle();
			},
			onload: function (l,  rd) {
				$x("id('content')/div[@class='friend']/div[@class='usr']")
					.forEach(that.cleanrow);
				$(li).toggle();
			},
			onerror: function (l, rd) {
				$(li).toggle();
			}
		});
	},
	
	cleanrow: function(row) {
		/*
		var n, b;
		if (n = $($xs("./span[contains(@class, 'newImagesForFriend')]", row)))
			n.remove();
		if (b = $($xs("./a/b", row))) {
			$(b.parentNode).text($(b.firstChild).text());
			b.remove();
		}
		*/
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
