// ==UserScript==
// @name           SGS Tvättbok Google Calender Integration
// @namespace      arvid.jakobsson@gmail.com
// @include        http://tvatta.sgsstudentbostader.se/wwwashcalendar.aspx?*
// ==/UserScript==

/*
 *  TODO:
 *   * Ställa in rätt location
 *   * Kompensera för vecka.
 */

var sgs_tvatt_gc = {

  iconUrl: 'http://calendar.google.com/googlecalendar/images/favicon.ico',

  init: function() {
    var cal = this.parseCalender();
    var that = this;
    cal.filter(function(p) {return p.status == 'own';}) .forEach(
        function(p) {
          that.addGCLink(p);
        });
  },

  addGCLink: function (pass) {
    var details = {
      name: 'Tvätttid',
      location: 'Tvättstugan',
      description: 'Dags att tvätta!'
    };

    var cell = create('td');


    var linkUrl = this.gc_addEventUrl(details, pass.timeSpan.startTime, pass.timeSpan.endTime);
    var link = create('a', {'href': linkUrl});

    var icon = create('img', {'src': this.iconUrl});
    link.appendChild(icon);

    cell.appendChild(link);
    console.log(cell);
    pass.iconRow.appendChild(cell);
  },

  parseCalender: function () {
    var cal = [];
    //for every day:

    // for each row.
    var that = this;
    $x("//th[position() > 1]")
      .forEach(
	function (th, day) {
          // assume we are viewing the current week
          var baseDate = new Date();

          var txt = th.textContent;
          var m = txt.match(/(\d+)\/(\d+)/);

          baseDate.setDate(parseInt(m[1], 10));
          baseDate.setMonth(parseInt(m[2], 10) - 1);

	  // for each cell in that row.
          $x("id('tbl1')/tbody/tr[position() > 1]/td[" + (day+2) + "]") .forEach( //position starts at 1!
            function (td, tim) {
              var time = $xs("./../td[1]", td);
              var timeSpan = that.parseTimes(baseDate, time.textContent);

              // find status
              var iconUrl = $xs(".//img/@src", td).value;
              var slotStatus = that.parseStatus(iconUrl);
              var iconRow = $xs(".//tr[td[img[contains(@src, 'icon_own')]]]", td);
	      

              cal.push(
                {
                  timeSpan: timeSpan,
                  status: slotStatus,
                  iconRow: iconRow
                }
              );
            });
        });
    return cal;
  },

  parseStatus: function (iconUrl) {
    var statusIcons = {
      passed: 'images/icon_no_not.gif',
      booked: 'images/icon_no.gif',
      free: 'images/icon_plus.gif',
      own: 'images/icon_own.gif'
    };

    var slotStatus = 'unknown';
    for (status in statusIcons) {
      if (iconUrl == statusIcons[status]) {
        slotStatus = status;
      }
    }
    return slotStatus;
  },

  parseTimes: function(baseDate, str) {
    var st = new Date(baseDate);
    var et = new Date(baseDate);

    var m = str.match(/(\d+):(\d+)-(\d+):(\d+)/);
    var times = m.slice(1).map(function (s) { return parseInt(s, 10); });

    st.setHours(times[0]);
    st.setMinutes(times[1]);

    et.setHours(times[2]);
    et.setMinutes(times[3]);

    return {
      endTime: et,
      startTime: st
    };
  },

  lpad: function(str, len, chr) {
    // convert to string if necessary
    if (typeof str == 'number')
      str = str + "";

    chr = chr || "0";
    len = len || "2";
    while(str.length < len) {
      str = chr + str;
    }
    return str;
  },

  // Date in yyyymmddThhmm00 format
  dateToString: function(date) {
    return lpad(date["year"], 4, "20") +
      lpad(date["month"], 2, "0") +
      lpad(date["day"], 2, "0") + "T" +
      lpad(date["hours"], 2, "0") +
      lpad(date["minutes"], 2, "0") + "00";
  },

  // Javascript Date-object in yyyymmddThhmm00 format
  jsDateToString: function(date) {
    return [
      date.getFullYear(),
      this.lpad(date.getMonth() + 1),
      this.lpad(date.getDate()),
      "T",
      this.lpad(date.getHours()),
      this.lpad(date.getMinutes()),
      "00"
    ].join("");
  },

  urlifyParams: function(params) {
    var s = [];
    for (paramKey in params) {
      s.push(paramKey + "=" + params[paramKey]);
    }
    return s.join('&');
  },

  gc_addEventUrl: function (details, startDate, endDate) {
    var urlBase = 'http://www.google.com/calendar/event';

    var params = {
      action: 'TEMPLATE',
      text: encodeURIComponent(details["name"]),
      dates: this.jsDateToString(startDate) + "/" + this.jsDateToString(endDate),
      details: encodeURIComponent(details["description"]),
      location: encodeURIComponent(details["location"]),
      trp: 'true',
      sprop: 'www.facebook.com&sprop=name:'
    };

    return urlBase + '?' + this.urlifyParams(params);
  }
};

sgs_tvatt_gc.init();
// document.body.addEventListener(
//   'load',
//   bind(sgs_tvatt_gc.init(), sgs_tvatt_gc),
//   true
// );


/*
 * STD - functions
 */
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
  var a, args;
  args = $A(arguments);
  args.shift();
  while ((a = args.shift()) !== undefined)
    str = str.replace("\f", a);
  return str;
}

function $(id) {
  return document.getElementById(id);
}

// funkar om n != <html>
function remove(n) { n.parentNode.removeChild(n); }

                     // console.log(time.textContent);

                     /*
                     var startTime = new Date(baseDate);
                     var endTime = new Date(baseDate);

                     var m = time.textContent.match(/(\d+):(\d+)-(\d+):(\d+)/);
                     var times = m.slice(1).map(function (s) { return parseInt(s, 10); });

                     startTime.setHours(times[0]);
                     startTime.setMinutes(times[1]);

                     endTime.setHours(times[2]);
                     endTime.setMinutes(times[3]);
                      */
