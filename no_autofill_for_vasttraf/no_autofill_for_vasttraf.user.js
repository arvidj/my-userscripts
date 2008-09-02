// ==UserScript==
// @name           No autofill for Vasttrafiks reseplanerare
// @namespace      arvid.jakobsson@gmail.com
// @description    No autofill for Vasttrafiks reseplanerare
// @include        http://vasttrafik.se/sv/*
// @include        http://vasttrafik.se/sv/Att-resa/Reseplaneraren/?*
// ==/UserScript==

document.addEventListener('load', function (e) {
	$x("id('ctl00_FullRegion_MainAndFooterRegion_MainRegion_TravelPlannerStandard_TravelPlannerTextBoxFrom_TravelPlannerTextBoxFromTextBox') | " + 
			"id('ctl00_FullRegion_MainAndFooterRegion_MainRegion_TravelPlannerStandard_TravelPlannerTextBoxTo_TravelPlannerTextBoxToTextBox') | " + 
			"id('ctl00_FullRegion_RightRegion_TripSearchRegion_TripSearchStartPage_AutocompleteFrom') | " + 
			"id('ctl00_FullRegion_RightRegion_TripSearchRegion_TripSearchStartPage_AutocompleteTo')").forEach(function(v) {
		console.log(v.getAttribute('id'));
		v.setAttribute('autocomplete', 'off');
	});
}, true);

function $x(xpath, root) { // From Johan Sundström
	var doc = root ? root.evaluate ? root : root.ownerDocument : document, next;
	var got = doc.evaluate(xpath, root||doc, null, null, null), result = [];
	while(next = got.iterateNext())
		result.push(next);
	return result;
}