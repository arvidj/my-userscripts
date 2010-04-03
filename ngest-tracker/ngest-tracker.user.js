// ==UserScript==
// @name           Ångest-tracker
// @namespace      arvid.jakobsson@gmail.com
// @include        *
// ==/UserScript==

var angstTracker = {
  trackerDiv: null,

  config: {
    wordsWritten: 0,
    wordsToWrite: 0,
    deadline: null,

    read: function() {
      cfg = deserialize('angstTrackerConfig', {wordsWritten: 0, wordsToWrite: 0, deadline: null});
      this.wordsWritten = cfg.wordsWritten;
      this.wordsToWrite = cfg.wordsToWrite;
      this.deadline = cfg.deadline;
    },

    save: function() {
      serialize('angstTrackerConfig', {
		  wordsToWrite: this.wordsToWrite,
		  wordsWritten: this.wordsWritten,
		  deadline: this.deadline
		}
	       );
    },

    input: function() {
      this.wordsWritten = prompt("How many words will you have to write in total?", this.wordsWritten);
      this.wordsToWrite = prompt("How many words will you have to write in total?", this.wordsToWrite);
      this.deadline = new Date(prompt("When is your deadline? (October 12, 1988 13:00)", this.deadline));

      this.save();
    }
  },

  update: function () {
    if ((td = this.trackerDiv)) {
      var cfg = this.config;

      var now = new Date();
      var timeLeft = cfg.deadline - now;
      var timeLeftHours = timeLeft / (60*60*1000);

      td.innerHTML = sprintf("<p><strong>\f/\f</strong> words written, <p><strong>\f</strong> hours left, <p><strong>\f</strong> words / per hour required.",
			     cfg.wordsWritten,
			     cfg.wordsToWrite,
			     decimals(timeLeftHours, 1),
			     decimals((cfg.wordsToWrite - cfg.wordsWritten)/timeLeftHours, 1));
    }
  },

  add: function() {
    var td = create('div', {'id': 'angstTrackerDiv'}, document.body);
    this.trackerDiv = td;
    GM_addStyle('#angstTrackerDiv { '
		+ 'padding: 3px !important; '
		+ 'position: fixed; '
		+ 'top: 0px; '
		+ 'right: 0px; '
		+ 'width: auto !important; '
//		+ 'height: 10px; '
		+ 'background-color: white ! important; '
		+ 'text-color: black ! important; '
		+ 'font-family: verdana !important;'
		+ 'border: 1px solid black !important; }');

    var that = this;
    td.addEventListener('click', function() {
			  that.config.input();
			  that.update();
			}, false);
  },

  init: function () {
    this.config.read();
    this.add();
    this.update();
    setInterval(bind(this.update, this), 1000);
  }
};

angstTracker.init();

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
	return eval(GM_getValue(name, def) );
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
String.prototype.trim = function() { return this.replace(/^\W+|\W+$/gi, ""); };

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


