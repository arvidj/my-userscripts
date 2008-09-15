// ==UserScript==
// @name           Bilddagboken.se - focus on username-input
// @namespace      arvid.jakobsson@gmail.com
// @include        http://bilddagboken.se/p/main.html*
// @include        http://www.bilddagboken.se/p/main.html*
// ==/UserScript==

window.addEventListener('load', function (ev) {
			  var ul= document.getElementById('userLogin').focus();
			}, false);

