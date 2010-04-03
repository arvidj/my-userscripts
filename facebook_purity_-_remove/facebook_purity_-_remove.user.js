// ==UserScript==
// @name           Facebook Purity - Removes annoying quiz and application messages from your facebook homepage
// @namespace      http://steeev.freehostia.com
// @description    Removes messages posted by applications to your facebook homepage
// @include        http://www.facebook.com/*
// @include        http://www.new.facebook.com/*
// @version        1.51 - 30th March 2009
// ==/UserScript==

// UPDATES
// 30th March 2009 Bug fixed: if there were no pending requests, the script didnt work

// (C) stephen fernandez 2009

( function () {

  var crappyappmsgcounter=0;
  
  GM_addStyle ('.fbpblocked {border-style: dashed; border-width:1px; border-color: lightpink} ');
  document.addEventListener("DOMNodeInserted", fpInsertedNodeDomHandler, false);

  function fpInsertedNodeDomHandler(event) {
    if(location.href.match('\/home\.php') && event.target.getElementsByClassName && event.target.getElementsByClassName('UIIntentionalStory_AttachmentInfo'))
      cleartheshizzle(event.target);          
  }

  var cleartheshizzle=function(thenode) {
  
    if(!document.getElementById('fbpblockcount')) {
      crappyappmsgcounter=0;
      var insertpoint = document.getElementById('pymk_hp_box'); // people you may know box
      if(insertpoint) {
        var fbpurityinfo=document.createElement('div');
        fbpurityinfo.setAttribute('class','UIOneOff_Container');
        fbpurityinfo.style.marginBottom='12px';
        fbpurityinfo.innerHTML='<a href="http://tinyurl.com/fbpure">FB Purity</a> blocked: <span id="fbpblockcount">0</span> app msgs [ <a onclick="if(this.textContent==\'Show\')this.textContent=\'Hide\';else this.textContent=\'Show\';fbpshowblocked();return false;" id="fbpshowblockedlink" href="javascript:;">Show</a> ]';
        insertpoint.parentNode.insertBefore(fbpurityinfo, insertpoint);
        fpbblockcountspan=document.getElementById('fbpblockcount');
      }
    }
    var footernodes=thenode.getElementsByClassName('UIIntentionalStory_AttachmentInfo');
    for(i=0;i<footernodes.length;i++) {
      if(footernodes[i].innerHTML.match('facebook\.com\/apps\/')) {
        footernodes[i].parentNode.parentNode.parentNode.style.display='none';
        footernodes[i].parentNode.parentNode.parentNode.setAttribute('class',footernodes[i].parentNode.parentNode.parentNode.getAttribute('class')+' fbpblocked');
        if(fpbblockcountspan)
          fpbblockcountspan.innerHTML=++crappyappmsgcounter;
        //console.log('another one bites the dust. (' + crappyappmsgcounter +')\n' );
      }
    }
  footernodes=null;
  }
  
  unsafeWindow.fbpshowblocked=function () {
   var blockedmsgs=document.getElementsByClassName('fbpblocked');
   var showorhide=document.getElementById('fbpshowblockedlink').textContent;
   if(showorhide.match('Hide'))
     displaymode='block';
   else
     displaymode='none';
   for(i in blockedmsgs)
     blockedmsgs[i].style.display=displaymode;
   blockedmsgs=null;
  }
  
  
  if(location.href.match('\/home\.php'))
    cleartheshizzle(document);

}) ();