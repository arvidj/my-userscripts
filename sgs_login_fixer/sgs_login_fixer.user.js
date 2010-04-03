// ==UserScript==
// @name           SGS login fixer
// @namespace      arvid.jakobsson@gmail.com
// @include     http://www.sgsstudentbostader.se/item.aspx?id=86
// @include     http://www.sgsstudentbostader.se/item.aspx?id=1
// @include	http://www.sgsstudentbostader.se/item.aspx?id=979
// @include	http://www.sgsstudentbostader.se/item.aspx?id=93
// @include     http://sgsstudentbostader.se/item.aspx?id=86
// @include     http://sgsstudentbostader.se/item.aspx?id=1
// @include	http://sgsstudentbostader.se/item.aspx?id=979
// @include     http://sgsstudentbostader.se/item.aspx?id=93
// ==/UserScript==

var canvasW, canvasH, canvasCtx;
var goalLogins = 250;

function hijackLogin() {
  var client = $('client');
  var pin = $('pin');

  if (client && pin) {
    [client, pin].forEach(function(v) {
        v.addEventListener('keyup', function (e) {
            if (e.keyCode == 13) {
              login();
            }
          }, false);
      });

    $x("//a[@href='javascript:redirect();']").forEach(function(link) {
        link.addEventListener('click', function (e) {
            login();
          }, false);
        link.setAttribute('href', '');
      });
  }
}

function login(){
  //animatePlusone();
  GM_setValue('logins', GM_getValue('logins', 0)+1);

  var sClient = $('client').value;
  var sPin = $('pin').value;
  var sId = $('id').value;
  var sRedirect = $('redirect').value;
  window.location = sRedirect + "&id=" + sId + "&client=" + sClient + "&pin=" + sPin;
}

function addCounter() {
  var pin = $('client');
  canvasW = pin.offsetWidth, canvasH = 20;
  var canvas = document.createElement('canvas');
  canvas.setAttribute('id', 'progress-bar');
  canvas.setAttribute('width', canvasW );
  canvas.setAttribute('height', canvasH );

  var pageNr = parseInt(location.href.match(/id=(\d+)&?/)[1], 10);
  if (pageNr == 86 || pageNr == 979) {
    var placeBefore= $xs("id('pin')/following-sibling::br[2]");
    placeBefore.parentNode.insertBefore(canvas, placeBefore);
  }
  else if ( pageNr == 93 || pageNr == 86 || pageNr == 1) {
    var parent = $xs("id('pin')/parent::*");
    parent.appendChild(canvas);
  }

  paintCounter(canvas);
}

function paintCounter(canvas) {
  canvasCtx = canvas.getContext("2d");

  canvasCtx.fillStyle = "rgb(0,0,0)";
  canvasCtx.fillRect (0, 0, canvasW,  canvasH);

  canvasCtx.fillStyle = "rgb(255,255,255)";
  canvasCtx.fillRect (1, 1, canvasW-2, canvasH-2);

  var lingrad = canvasCtx.createLinearGradient(1,canvasH/2,canvasW-1,canvasH/2);
  lingrad.addColorStop(0, '#00ABEB');
  lingrad.addColorStop(1, '#0f0');

  var logins = GM_getValue('logins', 0);
  var fillW = (logins / goalLogins) * (canvasW - 2);
  canvasCtx.fillStyle = lingrad;
  canvasCtx.fillRect(1, 1, fillW, canvasH - 2);
}

function animatePlusone() {
  console.log('animate');

  var img = new Image();
  img.src = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%06%00%00%00%06%08%02%00%00%00o%AEx%1F%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%D8%07%14%11%2C6%B4%8D%1FJ%00%00%00%19tEXtComment%00Created%20with%20GIMPW%81%0E%17%00%00%00)IDAT%08%D7c%FC%FF%FF%3F%03*%60B%E33222A(8%1FE%FE%FF%FF%FF%10C%98%20%14%B2%89%8C%98%C6%03%00U%EB%12%005%EDZ%18%00%00%00%00IEND%AEB%60%82";

  canvasCtx.drawImage(img, canvasW - 1 - 5 - img.width, canvasH - 1 - 3 - img.width);
}

if ($('client') && $('pin')) {
  hijackLogin();
  addCounter();
}

/*
 */

function $x(xpath, root) { // From Johan Sundström
  var doc = root ? root.evaluate ? root : root.ownerDocument : document, next;
  var got = doc.evaluate(xpath, root||doc, null, null, null), result = [];
  while(next = got.iterateNext())
    result.push(next);
  return result;
}

function $xs(xpath, root) {
  return $x(xpath, root)[0];
}

function $(id) { return document.getElementById(id); }

function $A(arr) {
  var r = [], len = arr.length;
  while (len--) r.unshift(arr[len]);
  return r;
}
