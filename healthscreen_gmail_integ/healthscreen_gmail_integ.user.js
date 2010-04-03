// ==UserScript==
// @name           Healthscreen GMail integration
// @namespace      arvid.jakobsson@gmail.com
// @description    Integrates GMail clients with healthscreen
// @include        https://mail.google.com/mail/*
// @include        http://mail.google.com/mail/*

// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js
// @require        http://plugins.jquery.com/files/jqSOAPClient.js_4.txt
// @require        http://plugins.jquery.com/files/jqXMLUtils.js_5.txt
// @require	   http://pajhome.org.uk/crypt/md5/md5.js

// ==/UserScript==


/*
 * gmail: handles gmail specific functions
 */
var gmail = {
  init: function() {
    log("> gmail.init");
    this.canvasFrame = $xs("id('canvas_frame')");
    log("< gmail.init");
  },

  getNavPane: function() {
    var frameDoc = $x("id('canvas_frame')")[0].contentDocument;
    log("gmail.getNavPane, framedoc: %s, url: %s", frameDoc, frameDoc.location.href);

    return $xs(".//div[@class='IY0d9c']/div[@class='XoqCub EGSDee' and @style]/div[@class='XoqCub' and div[contains(@class, 'cOSVMd')]]", frameDoc);
  },

  createNavBar: function(details) {
    var navPane = this.getNavPane();
    if (!navPane)
      throw "createNavBar could not find getNavPane";

    var navBarStyle = "background-color: " + details.color + "; margin: 0px 9px 0px 0px; -moz-border-radius: 2px;";
    var navBar = create("div", {style: navBarStyle}, navPane);

    var title = create("h2", {}, navBar);
    title.textContent = details.title || "No title specified";

    var expandToggle = create("a", {}, title);;
    expandToggle.addEventListener("click", function () {
				    log("exand/collapse");
				  }, false);

    var content = create("div", {}, navBar);
    content.innerHTML = details.content || "No content specified";
  },

  createSideBar: function (content, sideBarStyle) {
    log("> gmail.createSideBar");

    content = content || "";

    var sideBarDiv = create("div", {'class': 'GM_sideBarElement'});
    style(sideBarDiv, sideBarStyle || {});

    sideBarDiv.innerHTML = content;
    style(sideBarDiv, {cssFloat: 'right', height: '100%', width: '15%'});

    this.canvasFrame.parentNode.insertBefore(sideBarDiv, this.canvasFrame.nextSibling);
    style(this.canvasFrame, {cssFloat: 'left', height: '100%', width: '85%'});

    log("< gmail.createSideBar");

    return sideBarDiv;
  }
};

/*
 * gmhs: GMail - Healtscreen integration
 */
var gmhs = {
  sidebar: null,
  contentDiv: null,

  onload: function() {
    try {
      if (document.location == top.location) { // && location.href == "https://mail.google.com/mail/#inbox") {
	log("activating on url", location.href);
	this.checkDependencies();

	try {

	  gmail.init();

	  this.sideBar = gmail.createSideBar(''
			   + '<div style="margin: 0 10px;">'
			   + '<h2 class="gmhs-sidebar-title">Sugar</h2>'
			   + '<div class="gmhs-sidebar-content"></div>'
			   + '<div class="gmhs-sidebar-controls></div>'
			   + '</div>'
	  );
	  this.contentDiv = this.sideBar.getElementsByClassName('gmhs-sidebar-content')[0];

	  if (sugar.isLoggedIn()) {
	  }
	  else {
	    var credentials = this.getCredentials();
	    this.showLoginForm(credentials);
	  }

	}
	catch (e) {
	  log("Exception thrown when creating sidebar element:" + e);
	}
      }
      else
	log("not activating on url: %s", location.href);
    }
    catch (e) {
      log("exception thrown gmhs.onlaod");
      log(e);
    }
  },



  showLoginForm: function(credentials) {
    log("> gmhs.showLoginForm");
    this.contentDiv.innerHTML = "<h3>Login</h3>";
    credentials = credentials || {username: "", password: "", remember: false};
    /*

     <form>
     <label for="gmhs-username">Username</label><input type="text" name="gmhs-username" value="" />
     <label for="gmhs-password">Password</label><input type="text" name="gmhs-password" value="" />
     <label for="gmhs-remember">Remember</label><input type="text" name="gmhs-remember" value="" />
     <input type="submit" value="login" />
     </form>

     */
    var loginfrm = create('form', {}, this.contentDiv);

    var userlbl = create('label', {for: 'gmhs-username'}, loginfrm);
    userlbl.textContent = 'Username:';
    var userinp = create('input', {type: 'text', name: 'gmhs-username', value: credentials.username}, loginfrm);

    var passlbl = create('label', {for: 'gmhs-password'}, loginfrm);
    passlbl.textContent = 'Password:';
    var passinp = create('input', {type: 'password', name: 'gmhs-password', value: credentials.password}, loginfrm);

    var rememberlbl = create('label', {for: 'gmhs-remember'}, loginfrm);
    rememberlbl.textContent = 'Remember:';
    var rememberinp = create('input', {type: 'checkbox', name: 'gmhs-remember', checked: (credentials.remember ? 'on' : 'off')}, loginfrm);

    var submit = create('input', {type: 'submit', name: 'gmhs-submit', value: 'submit'}, loginfrm);

    var that = this;
    loginfrm.addEventListener('submit', function (ev) {
				ev.preventDefault();
				ev.stopPropagation();
				log("submitting form, logging in");
				that.login(userinp.value, passinp.value, rememberinp.value);
			      }, false);
  },

  login: function(user, pass, rmb) {
    log('logging in: ' + $A(arguments).join(', '));
    if (rmb) {
      serialize('gmhs-credentials',
	{username: user, password: pass, remember: rmb});
    }
    sugar.login(
      user,
      pass,
      bind(this.onLoginLoad, this),
      bind(this.onLoginError, this));
  },

  onLoginError: function(rd) {
    log('something strange occurred when logging in!');
  },

  onLoginLoad: function(rd) {
    log('logged in!');
    this.showClients();
  },

  showClients: function() {
    this.contentDiv.innerHTML = '<h3>Clients</h3><ol>' +
      '<li>Some client</li>' +
      '<li>Some client</li>' +
      '<li>Some client</li>' +
      '</ol>';
  },

  getCredentials: function () {
    return deserialize("gmhs-credentials");
  },

  checkDependencies: function () {
    if (jQuery)
      log("Has jQuery");
    else
      throw depencyException("jQuery");

    if (jQuery.xmlToJSON)
      log("has jQuery.xmlToJSON");
    else
      throw depencyException("jQuery.xmlToJSON");

    if (SOAPClient)
      log("has SOAPClient");
    else
      throw depencyException("SOAPClient");
  },

  depencyException: function(dependency) {
    return sprintf('Dependency "\f" missing!', dependency);
  }

};

var sugar = {
/*  soapUrl: "https://sugar.healthscreen.com/soap.php", */
  soapUrl: "http://demo.sugarcrm.com/sugarcrm/soap.php",
  sessionId: "",
  charSet: "utf-8",

  soapEnvelope: {
    head: '<?xml version="1.0" encoding="UTF-8"?>'
      + '<SOAP-ENV:Envelope '
      + 'xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" '
      + 'xmlns:ns1="http://www.sugarcrm.com/sugarcrm" '
      + 'xmlns:xsd="http://www.w3.org/2001/XMLSchema" '
      + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
      + 'xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" '
      + 'SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">'
      + '<SOAP-ENV:Body>',

    tail: '</SOAP-ENV:Body></SOAP-ENV:Envelope>',
    join: function (body) {
      return this.head + body + this.tail;
    }
  },

  initSoapClient: function () {
    console.log("> Sugar.initSoapClient");

    console.log("< Sugar.initSoapClient");
  },

  /*
   * SOAP-requests
   */

  login: function (username, password, load, error) {
    console.log("> Sugar.login");

    var loginbody = '<ns1:login>'
		    + '<user_auth xsi:type="ns1:user_auth">'
		    + '<user_name xsi:type="xsd:string">' + username + '</user_name>'
		    + '<password xsi:type="xsd:string">' + hex_md5(password) + '</password>'
		    + '<version xsi:type="xsd:string">1</version>'
		    + '</user_auth>'
		    + '<application_name xsi:nil="true"/>'
		    + '</ns1:login>';


    this.sendRequest('login', loginbody, load, error);

    console.log("< Sugar.login");
  },

  test: function (testStr, load, error) {
    console.log("> Sugar.test");

    var body = '<ns1:test><string xsi:type="xsd:string">' + testStr + '</string></ns1:test>';
    this.sendRequest('test', body, load, error);

    console.log("< Sugar.test");
  },

  isLoggedIn: function() {
    return this.sessionId != "";
  },

  sendRequest: function(soap_action, body, onload, onerror) {
    log(sprintf("sendRequest, action: \f", soap_action));

    var data = this.soapEnvelope.join(body);
    var proxy = this.soapUrl;
    var action = proxy + '/' + soap_action;
    GM_xmlhttpRequest({
			method: "POST",
			url: proxy,
			headers: {
			  "Content-Type": "text/xml; charset=\"\"" + this.charSet + "\"",
			  "SOAPAction": sprintf('"\f"', action)
			},
			data: data,
			onload: function (rd) {
			  log("sugar.sendRequest.onload");
			  if (onload)
			    onload(rd);
			},
			onerror: function (rd) {
			  log("sugar.sendRequest.onerror");
			  if (onerror)
			    onerror(rd);
			}
		      });
  },

/*
  testCallback: function(responseObject) {
    console.log("Sugar.testCallback");
    console.log(responseObject.toSource());;
  },

  loginCallback: function(responseObject) {
    console.log("Sugar.loginCallback");
    console.log(responseObject);
  },
*/
  getContacts: function() {}
};

log("Healthscreen gmail: start");
window.addEventListener("load", bind(gmhs.onload, gmhs), false);

/*
 *  My standard library :)
 */

function style(n, style) {
  if (style.constructor == String) {
    return n.style[style];
  }
  else if (style.constructor == Object) {
    for (var prop in style)
      n.style[prop] = style[prop];
    return n;
  }
  return null;
}

function create(nn, attr, p) {
  var n = document.createElement(nn);
  for (a in attr)
    n.setAttribute(a, attr[a]);
  if (p) p.appendChild(n);
  return n;
}

function log() {
  if (console)
    console.log.apply(this, arguments);
  else if (GM_log)
    GM_log($A(arguments).join(""));
}

fireEvent = function fireEvent(node, type) {
  var evt = document.createEvent("Event");
  evt.initEvent(type, true, false); // bubble, don't be cancelable
  node.dispatchEvent(evt);
};

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

function profile(obj){
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

  for (var prop in obj) {
    if (obj[prop].constructor == Function) {
      console.log("adding profiling for " + prop);
      obj["_" + prop] = obj[prop];
      obj[prop] = (function(prop) {
		     return function () {
		       console.log("profiling " + prop);
		       tictac.tic();
		       console.log($A(arguments).join(", "));
		       obj["_" + prop].apply(obj, arguments);
		       console.log(prop + ": " + tictac.tac() + " ms");
		     };
		   })(prop);
    }
  }
  return obj;
}

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

function dateSort(a, b, asc) { return sortf(parseRelDate(a), parseRelDate(b), asc); };

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

function deserialize(name, def) {
	return eval(GM_getValue(name, def) );
}

function serialize(name, val) {
	GM_setValue(name, uneval(val));
}
