// ==UserScript==
// @name           No autofill for Vasttrafiks reseplanerare
// @namespace      arvid.jakobsson@gmail.com
// @description    No autofill for Vasttrafiks reseplanerare
// @include        http://vasttrafik.se/
// @include        http://vasttrafik.se/Startsida
// @include        http://vasttrafik.se/sv/*
// @include        http://vasttrafik.se/sv/Att-resa/Reseplaneraren/?*
// ==/UserScript==

var xp = ["id('AutoCompleteFrom')/input",
          "id('AutoCompleteTo')/input"].join(" | ");
$x(xp).forEach(
    function(v) {
	    console.log(v.getAttribute('id'));
		v.setAttribute('autocomplete', 'off');
	}
);

function $x(xpath, root) { // From Johan Sundström
	var doc = root ? root.evaluate ? root : root.ownerDocument : document, next;
	var got = doc.evaluate(xpath, root||doc, null, null, null), result = [];
	while(next = got.iterateNext())
		result.push(next);
	return result;
}