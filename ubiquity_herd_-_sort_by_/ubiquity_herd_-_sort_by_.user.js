// ==UserScript==
// @name			Ubiquity Herd - Sort by installations
// @namespace		arvid.jakobsson@gmail.com
// @include		https://labs.toolness.com/ubiquity-herd/
// @include		https://labs.toolness.com/ubiquity-herd/all-feeds/
// ==/UserScript==

var herdSorter = {
	volatile: {
		rowxp: "//tr[position() > 1]",
		cellxp: ".//td[5]"
	},

	headers: {
		url: { 
			xp: "//tr[1]//th[1]",
			cell_xp: ".//td[1]",
			sort: sortstr
		},
		birth: { 
			xp: "//tr[1]//th[2]",
			cell_xp: ".//td[2]",
			sort: dateSort
		},
		lastseen: { 
			xp: "//tr[1]//th[3]",
			cell_xp: ".//td[3]",
			sort: dateSort,
			sortby: true
		},
		lifespan: { 
			xp: "//tr[1]//th[4]",
			cell_xp: ".//td[4]",
			sort: dateSort
		},
		subscribers: { 
			xp: "//tr[1]//th[5]",
			cell_xp: ".//td[5]",
			sort: sortf
		},
	},

	setListeners: function() {
		this.rows = $x(this.volatile.rowxp);
		this.rows.reinsert = function () { this.forEach(function (v) v.parentNode.appendChild(v) ) };
		console.log(this.rows.length + " commands");
		
		for (var header in this.headers) {
			var headerObj = this.headers[header];
			var headerEl = $xs(headerObj.xp);
			headerEl.addEventListener('click', curry(this.sortByHeader, this, header), true);
		}
	},
	
	sortByHeader: function(header) {
		console.log("sort by header:" + header);
		tictac.tic();
		var headerObj = this.headers[header];
		headerObj.sortby = true;
		
		this.rows.sort(function (rowa, rowb) {
			var texta = $xs(headerObj.cell_xp, rowa).textContent, textb = $xs(headerObj.cell_xp, rowb).textContent;
			return headerObj.sort(texta, textb)
		});
		
		tictac.tic();
		this.rows.reinsert();
		console.log("reinserting took: " + tictac.tac());
		console.log(sprintf("sorting took: \f millis", tictac.tac()));
	}
}

function add(a, b) {
    return a + b;
}

herdSorter.setListeners();

/*rows = $x(volatile.rowxp)
	.map(function(v) { 
		v.subs = parseInt($xs(volatile.cellxp, v).textContent, 10);
		return v;
	})
	.sort(function (a,b) { return b.subs - a.subs; })
	.forEach(function (v) { v.parentNode.appendChild(v); });
*/	


/* std functions */

var tictac = {
	now: function () {
		return new Date();
        },
	tic: function() {
        	this.times = this.times || [];
		return this.times.push(new Date());
	},
	tac: function() {
        	this.times = this.times || [];
		return this.now() - this.times.pop();
        }
};

function parseRelDate(relDateStr) {
	var dateParts = relDateStr.replace("ago", "").trim().split(","), now = (new Date());
	for (var i = 0; i < dateParts.length; i++) {
		var m = dateParts[i].trim().split(/\W+/);
		var value = m[0], unit = m[1];
		if (unit.match(/weeks?/)) {
			now.setDate(now.getDate() - value*7);
		}
		else if (unit.match(/days?/)) {
			now.setDate(now.getDate() - value);
		}
		else if (unit.match(/hours?/)) {
			now.setHours(now.getHours() - value);
		}
		else if (unit.match(/minutes?/)) {
			now.setMinutes(now.getMinutes() - value);
		}
	}
	return now;
}



function parseIntSort(a,b,asc) {
	return sortf(parseInt(a,10), parseInt(b,10), asc);
}

function sortf(a, b, asc) {	
	if (asc)
		return (a-b);
	else
		return -sortf(a,b, true);
}

function sortstr(a, b, asc) {
	if (asc)
		return (a > b) ? 1 : -1;
	else
		return !sortf(a, b, true);
}

function dateSort(a, b, asc) sortf(parseRelDate(a), parseRelDate(b), asc);

function $x(xpath, root) { // From Johan Sundström
	var doc = root ? root.evaluate ? root : root.ownerDocument : document, next;
	var got = doc.evaluate(xpath, root||doc, null, null, null), result = [];
	while(next = got.iterateNext())
		result.push(next);
	return result;
}

function $xs(xpath, root) $x(xpath, root)[0];
String.prototype.trim = function() this.replace(/^\W+|\W+$/gi, "");

function bind(method, obj) {
	return function() {
		method.apply(obj, arguments);
	};
}

function curry(method, obj) {
	var curryargs = $A(arguments).slice(2);
	return function() method.apply(obj || window, curryargs.concat($A(arguments)));
}

function $A(arr) {
    var r = [], len = arr.length;
    while (len--) r.unshift(arr[len])
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