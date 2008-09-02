// ==UserScript==
// @name           Google - remove redirect
// @namespace      arvid.jakobsson@gmail.com
// @include        http://www.google.tld/search?*
// @include        http://google.tld/search?*
// ==/UserScript==

$A(document.links).forEach(function (link) {
	if (link.getAttribute('class') == 'l')
		link.removeAttribute('onmousedown');
});

function $A(a) {
	if (!a) return []
	if (a.toArray) return a.toArray();
	var len = a.length || 0, r = [];
	while (len--) r[len] = a[len];
	return r;
}