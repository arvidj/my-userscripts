// ==UserScript==
// @name           	Ubiquity Command Editor - Integrate JSLint
// @namespace      	arvid.jakobsson@gmail.com
// @include       	chrome://ubiquity/content/editor.html
// @require		http://www.jslint.com/fulljslint.js
// ==/UserScript==

function source() { 
	return $('editor').value;
}

function options {
	return {};
}

alert('asdf');
console.log('asdf');
document.body.innerHTML = '';
var myResult = JSLINT(source(), options());
if (!myResult) {
	/*
	If false, you can inspect JSLINT.errors to find out the problems.
	JSLINT.errors is an array of objects containing these members:

	{
		line      : The line (relative to 0) at which the lint was found
		character : The character (relative to 0) at which the lint was found
		reason    : The problem
		evidence  : The text line in which the problem occurred
		raw       : The raw message before the details were inserted
		a         : The first detail
		b         : The second detail
		c         : The third detail
		d         : The fourth detail
	}
	*/
	
	var errors = JSLINT.errors;
	
}

