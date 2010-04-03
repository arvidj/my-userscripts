// ==UserScript==
// @name           eztv favorites
// @namespace      arvid.jakobsson@gmail.com
// @include        http://eztv.it/*
// ==/UserScript==



eztvfavorites = {
  favorites: null,
  ulRows: null,

  getFavorites: function() {
    if (this.favorites == null) {
      this.favorites = this.loadFavorites();
    }
    console.log(this.favorites == null);
    return this.favorites;
  },

  setFavorites: function(fav) {
    this.saveFavorites(this.favorites = fav);
  },

  loadFavorites: function() {
    return deserialize('favorites', '({})');
  },

  saveFavorites: function(fav) {
    console.log("serializing: " + fav);
    serialize('favorites', fav);
  },

  addStars: function() {
    (this.ulRows = eztv.getUploadRows()).forEach(bind(this.addStar, this));
  },
  addStar: function(row) {
    /*
    console.log("addStar!");
    console.log(row.showName);
     */

    row.star = create('span', {}, row.favCell);
    row.star.addEventListener('click',
			      curry(this.toggleFavorite, this, row),
			      this);
    this.updateRow(row);
  },

  isFavorite: function(row) {
    return this.getFavorites()[row.showName];
  },

  /*
  isNew: function(row) {
    return (row.season == 1 && row.episode == 1);
  },
*/

  updateRow: function(row) {
    row.star.textContent = "[" +
      (this.isFavorite(row) ? "F" : "") +
      "]";

/*    if (favs[row.showName]) {
      row.star.textContent = "[F]";
      row.star.setAttribute('style', 'color: green; font-weight: bold');
    }
    else {
      row.star.textContent = "[]";
      row.star.setAttribute('style', '');
    }
*/
  },

  toggleFavorite: function(row) {
    var favs = this.getFavorites();
    var name = row.showName;
    favs[name] = !favs[name];
    this.setFavorites(favs);
    this.ulRows.forEach(bind(this.updateRow, this));
  }

};



eztv = {
  getUploadRows: function(){
    var that = this;
    return $x("//tr[@class='forum_header_border']").map(
      function(rn) {
	try {
	  return {
	    node: rn,
	    favCell: that.getFavoriteCell(rn),
	    showName: that.getShowName(rn)
	  };
	}
	catch (e) {
	  return null;
	}
      }).filter(function(r) { return r != null; });
  },
  getFavoriteCell: function (row) {
    return $xs("./td[1]", row);
  },
  getShowName: function(row) {
    var relName = $xs(".//td[2]", row).textContent;
    try {
      var m = relName.match(/(.*?)(S\d+E\d+|\d+x\d|DivX|PDTV|HDTV)/)[1];
      return trim(m);
    }
    catch (e) {
      console.log("Could not get release name out of: " + relName);
      throw e;
    }
  }
};

eztvfavorites.addStars();

/* STD - functions */
function decimals(num, n) {
  var a = Math.pow(10, n);
  return Math.round(num*a) / a;
}

function create(nn, attr, p) {
  var n = document.createElement(nn);
  for (a in attr)
    n.setAttribute(a, attr[a]);
  if (p) p.appendChild(n);
  return n;
}

function deserialize(name, def) {
  var ev = eval(GM_getValue(name));
  return (ev != null ? ev :
    def != null ? def : null);
}

function serialize(name, val) {
  GM_setValue(name, uneval(val));
}

function $x(xpath, root) { // From Johan Sundström
  var doc = root ? root.evaluate ? root : root.ownerDocument : document, next;
  var got = doc.evaluate(xpath, root||doc, null, null, null), result = [];
  while((next = got.iterateNext())) {
	  result.push(next);
  }
  return result;
}

function $xs(xpath, root) { return $x(xpath, root)[0]; }

function trim(str) {
  return str.replace(/^\W+|\W+$/gi, "");
};

function bind(method, obj) {
  return function() {
    method.apply(obj, arguments);
  };
}

function curry(method, obj) {
  var curryargs = $A(arguments).slice(2);
  return function() { return method.apply(obj || window, curryargs.concat($A(arguments))); };
}

function $A(arr) {
  var r = [], len = arr.length;
  while (len--) r.unshift(arr[len]);
  return r;
}

function sprintf(str) {
  var a;
  args = $A(arguments);
  args.shift();
  while ((a = args.shift()) !== undefined)
    str = str.replace("\f", a);
  return str;
}

function $(id) {
  return document.getElementById(id);
}