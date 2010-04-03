// ==UserScript==
// @name           Spotify + Last.fm
// @namespace      http://extensions.hesslow.se/
// @description    Inserts Spotify links on Last.fm
// @include        http://last.fm/*
// @include        http://*.last.fm/*
// @include        http://lastfm.*/*
// @include        http://*.lastfm.*/*
// ==/UserScript==

// Last.fm seems to urlencode strings twice so remove the second urlencode step.
function cleanurl(str) {
    return str.replace(/%25([0-9]{2})/, '%$1');
}

// Remove whitespace in the beginning and end
function trim(str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
}

// Creates a link element
function createLink(link) {
    var a = document.createElement('a');
    a.href = link;
    a.title = 'Listen in Spotify'
    a.setAttribute('spotifyLink', true);
    var img = document.createElement('img');
    img.style.border = 'none';
    img.style.marginLeft = '3px';
    img.src = 'data:image/png;charset=utf-8;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGlJREFUeNpi%2BP%2F%2FPwMMuy1j%2BA%2FEBchiIMzEgAn63ZczzkcWwKaoEYgdgAr7cSraGfm%2FAUgZAnECPpNACj8AqQd4FQGtKgBSB2B8FqigArLxQPABaNoEFEVAcB6IBZCsW4DPdwewWQ8QYACnBy8V7gSvaAAAAABJRU5ErkJggg%3D%3D';
    a.appendChild(img);

    return a;
}

// Add links for the content under this element.
function addLinks(topElem) {
    // Check if we already added links for this content
    if (topElem.hasAttribute('spotifyLinksAdded'))
        return;
    topElem.setAttribute('spotifyLinksAdded', true);

    // This is a last.fm url that we want to rewrite
    var re = /^http:\/\/(.*\.|)(last\.fm|lastfm\.[^\/]+)\/music\/([^\?#]*)$/i;
    
    var elems = topElem.getElementsByTagName('a');
    for (var i = 0; i < elems.length; i++) {
        var elem = elems[i];
    
        // Ignore image links
        if (!elem.href || trim(elem.textContent) == '' || elem.className.match(/\blfmButton\b/))
            continue;

        // Check if the link matches
        if (m = re.exec(elem.href)) {
            var found = false;

            // Go though parts and check if it is an url that we want to change
            parts = m[3].split('/');
            for (var j = 0; j < parts.length; j++) {
                if (parts[j][0] == '+') {
                    found = true;
                    break;
                }
            }

            if (found)
                continue;

            // Ignore links in the left menu and some other places
            var p = elem;
            while (p != null) {
                if (p.id && p.id.match(/^(secondaryNavigation|featuredArtists)$/) || p.className && p.className.match(/\b(pagehead|image|artistsMegaWithFeatured)\b/)) {
                    found = true;
                    break;
                }
                p = p.parentNode;
            }
    
            if (found)
                continue;

            // Create the spotify url
            q = ['artist%3a%22'+ cleanurl(parts[0]) +'%22'];
            if (parts[1] && parts[1] != '_')
                q.push('album%3a%22'+ cleanurl(parts[1]) +'%22');
            if (parts[2])
                q.push('track%3a%22'+ cleanurl(parts[2]) +'%22');
    
            var a = createLink('spotify:search:'+ q.join('%20'));

            // Insert the link after the found link
            // Check if it already have a spotify url
            if (!elem.nextSibling || !elem.nextSibling.hasAttribute || !elem.nextSibling.hasAttribute('spotifyLink')) {
                elem.parentNode.insertBefore(a, elem.nextSibling);
            }
        }
    }
}

// Add listener so if the content changes we add links to the new content
document.addEventListener('DOMNodeInserted', function(ev){ addLinks(ev.originalTarget); }, true);

// Add links to titles like the artist name on the artist page.
var body = document.body;
var div = document.getElementById('catalogueHead');
if (body.className && div) {
    if (body.className.match(/\br\-artist\b/)) {
        // artist page
        var h1 = div.getElementsByTagName('h1')[0];
        h1.appendChild(createLink('spotify:search:artist%3a%22'+ encodeURIComponent(h1.textContent) +'%22'));
    } else if (body.className.match(/\br\-album\b/)) {
        // album page
        var h1 = div.getElementsByTagName('h1')[0];
        var a = createLink('spotify:search:artist%3a%22'+ encodeURIComponent(h1.firstChild.textContent) +'%22%20album%3a%22'+ encodeURIComponent(h1.lastChild.textContent) +'%22');

        h1.appendChild(a);
        div.previousSibling.previousSibling.getElementsByTagName('h1')[0].appendChild(a.cloneNode(true))
    } else if (body.className.match(/\br\-track\b/)) {
        // track page
        var h1 = div.getElementsByTagName('h1')[0];
        var a = createLink('spotify:search:artist%3a%22'+ encodeURIComponent(h1.firstChild.textContent) +'%22%20track%3a%22'+ encodeURIComponent(h1.lastChild.textContent.substring(3)) +'%22');

        h1.appendChild(a);
        div.previousSibling.previousSibling.getElementsByTagName('h1')[0].appendChild(a.cloneNode(true))
    }
}

// Find links and add spotify links to them
addLinks(body);