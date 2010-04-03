// ==UserScript==
// @name           Youtube HD
// @namespace      userscripts.org
// @description    Redirects to the HD version of a video
// @version        0.2
// @include        http://youtube.com/watch?*
// @include        http://www.youtube.com/watch?*
// @include        http://*.youtube.com/watch?*
// ==/UserScript==

var dUrl = document.URL;

var newurl;

if(!dUrl.match('&fmt=18')){

	(dUrl.match('&'))? newurl = dUrl.replace(/&/, '&fmt=8&'): newurl = dUrl+'&fmt=18';

window.location.replace(newurl);

}