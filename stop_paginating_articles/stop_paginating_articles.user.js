// ==UserScript==
// @name           STOP PAGINATING ARTICLES
// @namespace      arvid.jakobsson@gmail.com
// @include        *
// ==/UserScript==

var offending_pages = [
{//computerworld.com
  isPage: curry(location, match, /http:\/\/www.computerworld.com.au\/index.php\/id;.*/),
  getPageLinks: function () {
    return unique($x("//div[@class='page_links']/ul/li[position() != last()]/a/@href").map(function (attr) { return attr.value; }));
  },
  getCurrentPage: function (doc) {
    return $xs("//div[@class='art_lcol']", doc);
  },
  inject: function (nodeset) {
    $A(nodeset.childNodes).forEach(function (node) {
		      getCurrentPage().append(node);
		    });
  }


}
];

//a = http://www.computerworld.com.au/index.php/id;1974033854;fp;;fpid;

/*
offending_pages.forEach(function (off_page) {
			  if (off_page.isPage()) {
			    pages.forEach(function (pageurl) {
					    GM_xmlhttpRequest({
								url: pageurl,
								method: "GET",
								onload: function (rd) {
								  inject(current_article, getArticle(rd, page.article));
								}
							      }
							     );
					  });

			  }
		       });
*/
function unique(a) {
  var ret = [], len = a.len;
  while (len--)
    if (ret.indexOf(a[len]) == -1)
      ret.push(a[len]);

  return ret;
}