// ==UserScript==
// @name           Autofill form
// @namespace      arvid.jakobsson@gmail.com
// @include        http://bilddagboken.se/p/create.html?
// ==/UserScript==

var forms = [
	{
		url_regex: /http:\/\/bilddagboken\.se\/p\/create.html\??/,
		formfills: {
			name: 'theForm',
			inputs: {
				username: 'aittamaa',
				email: 'aittamaa',
				email2: 'aittamaa',
				surname: 'dfsgkjfdow',
				name: 'fasdkxnvcd',
				age: '1989',
				countySel: '22',
				citySel: '43',
				gender: '1',
				password: 'gahgah13',
				password2: 'gahgah13',
				sign: 'on'
			}
		}
	}
];

forms.filter(function(v) { return location.href.match(v.url_regex) !== null; }).forEach(function (v) {
	var form = $xs(v.formfills.name);
	for (input in v.formfills.inputs) {
		var value = v.formfills.inputs[input];
		var input_element = $xs("//*[@name='" + input + "' or @id='" + input + "']");
		input_element.value = value;
	}
});

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