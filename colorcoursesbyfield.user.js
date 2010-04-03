// ==UserScript==
// @name           	color courses by field
// @namespace      	arvid.jakobsson@gmail.com
// @include        	http://www.student.chalmers.se/sp/programplan?program_id=349&grade=*&conc_id=-1
// ==/UserScript==

(function () {
/*
	var colors = {
		'it': 'grey',
		'matte': 'green',
		'mts': 'red',
		'tnb': 'blue'
	};
	
	var cc_to_color_tbl = {
		'Informationsteknik': {c: 'grey', prefixes: ['DAT', 'EDA', 'TDA', 'TIN'], exceptions: },
		'Matte': {c: 'green', prefixes: [TMA, TMS, TMV], },
		'MTS': {c: 'red', prefixes: []},
		'Teknisk och naturvetenskaplig bredd': {c: 'blue', prefixes: []},
	};
	
	var exceptions
		
	var cc_fields = $x("//table[./tbody/tr[@class='fade']]/tbody/tr/td[2]");
*/
})();

function $x(xpath, root) { // From Johan Sundström
	var doc = root ? root.evaluate ? root : root.ownerDocument : document, next;
	var got = doc.evaluate(xpath, root||doc, null, null, null), result = [];
	while(next = got.iterateNext())
		result.push(next);
	return result;
}

function $xs(xpath, root) {
	return $x(xpath, root)[0];
}

function $(id) { return document.getElementById(id); }
