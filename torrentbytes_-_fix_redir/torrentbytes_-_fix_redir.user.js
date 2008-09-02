// ==UserScript==
// @name           torrentbytes - fix redirs
// @namespace      arvid.jakobsson@gmail.com
// @include        http://torrentbytes.net/*
// @include        http://www.torrentbytes.net/*
// ==/UserScript==

$A(document.links).forEach(function (link) {
	var m;
	if ( (m = link.getAttribute('href').match(/redir\.php\?url=(.*)$/)) !== null)
		link.setAttribute('href', decodeURIComponent(m[1]));
});

function $A(a) {
	if (!a) return [];
	var len = a.length || 0; ret = new Array(len);
	while (len--) ret[len] = a[len];
	return ret;
}