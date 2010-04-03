// Gmail Addons Version 3.8
// http://userscripts.org/scripts/show/19956

// ==UserScript==
// @name           Gmail Addons
// @namespace      http://exstodot.blogspot.com
// @description    Installs support for various gmail addons
// @include        http://mail.google.com/mail/*
// @include        https://mail.google.com/mail/*
// @include        http://mail.google.com/a/*
// @include        https://mail.google.com/a/*
// ==/UserScript==

/*
 * CHANGELOG
 * 3.8 : (07 Jun, 2008) Addons opened inside the main frame are no longer collapsed when viewing a conversation
 * 3.7 : (21 May, 2008) Keyboard shortcuts added.
 * 3.6 : (21 Apr, 2008) Miscellaneous changes to speed things up.
 * 3.5 : (28 Feb, 2008) Firefox 3 (beta 3) support added. Updated to account for Gmail's slight code change.
 * 3.4 : (27 Feb, 2008) Bug fix? - Some users reported occasional problems with this script. Though i have not been able to replicate that error, a few major changes have been made.
 * 3.2 : (29 Jan, 2008) Updated the script to remove incompatibilities with a few other scripts and extensions.
 * 3.1 : (24 Jan, 2008) Google Apps users can now modify the urls that the Addons have via the Prefs panel.
 * 3.0 : (22 Jan, 2008) Added support for Google Apps - it really works now :) (Thanks to jive for making a Google Apps account available for my use)
 * 2.0 : (19 Jan, 2008) Updated way to change any preferences (there is no need to edit the script anymore. Just right click on the little monkey icon and select 'User Script Commands' -> '! Gmail Addons Preferences') or just click on the 'Prefs' link on the top.<br/>
         Any addon can now be loaded *inside* the main gmail frame as requested.
         I havent been able to completely integrate Google Apps as i dont have any way to look at that type of bar thats on the top. However Google Apps users can now toggle any addon via the 'User Script Commands' Menu.<br/>
         Developers please note there have been minor changes to the way you can addon something.
 * 1.2 : (17 Jan, 2008) Fixed bug where some addons opened in the bottom would hide the others.
 * 1.1 : Added option FIX_TOGGLE_BAR to change whether the bar sticks to the top of the page<br/>
         for developers: added property callback, a function which will be called when gmail is fully loaded and the addon fully integrated
 * 1.0 : My old script completely rewritten. This one is wayyy better imho. :)
 */

/////////// USER OPTIONS

const FIX_TOGGLE_BAR = true; //fixes the top bar with the toggle links
const COLLAPSE_MAIL = true; //collapse the threadlist when an addon is opened that is inside the main frame
const COLLAPSED_MAIL_HEIGHT = 300; //height of mail when some 'bottom' based addon which is inside the mail frame is opened

/////////// DO NOT CHANGE ANYTHING BEYOND THIS POINT

const DEFAULT_WIDTH = 15;
const DEFAULT_HEIGHT = 50;
const DEFAULT_POSITION = 'bottom';

window.GmailAddons = 
{
	gm: undefined,
	fGmail: undefined,
	gbar: undefined,
	gbarapps: undefined,
	prefs: undefined,
	
	addonProperties: new Array(
		'url',
		'position',
		'height',
		'width',
		'openOnLoad',
		'indicatorLabel',
		'insideMainFrame',
		'shortcutKey'
	),
	addonPropertiesNames: new Array(
		'URL',
		'Position',
		'Height',
		'Width',
		'Open on Load',
		'Indicator Label',
		'Display Inside the Main Frame',
		'Shortcut Key'
	),
	
	addons: 
	{
		n: 0
	},
	
	gmailViewChange: function()
	{
		//remove all 'bottom' based addons without their own frames and insert after the new activeviewelement
		//to make sure it stays at the bottom
		if(!this.interfaceReady()) return;
		var a=this.addons;
		for(var i=0;i<a.n;i++)
		{
			if(a[i].processed&&a[i].position=='bottom'&&a[i].insideMainFrame)
			{
				a[i].inlineToggle.parentNode.removeChild(a[i].inlineToggle);
				a[i].f.parentNode.removeChild(a[i].f);
				this.gm.getActiveViewElement().firstChild.style.overflow='auto';
				this.gm.getActiveViewElement().firstChild.style.marginBottom='5px';
				this.gm.getActiveViewElement().appendChild(a[i].inlineToggle);
				this.gm.getActiveViewElement().appendChild(a[i].f);
			}
		}
		this.updateInterface();
	},
	
	interfaceReady: function()
	{
		log('poll');
		if(!this.fGmail) this.fGmail=top.document.getElementById('canvas_frame');
		if(this.fGmail)
		{
			if (!this.gbar) this.gbar = this.fGmail.contentDocument.getElementById('gbar');
			if (!this.gbarapps) this.gbarapps = this.fGmail.contentDocument.getElementById('cornerBookmarks-websearch');
			if (!this.gbarapps) this.gbarapps = this.fGmail.contentDocument.getElementById('cornerBookmarks-more');
			if (this.gbarapps && this.gbarapps.tagName == 'A') this.gbarapps = this.gbarapps.parentNode;
		}
		return ( true && this.gm && this.gm.getActiveViewElement() && (this.gbar || this.gbarapps) );
	},
	
	registerAddon: function(add)
	{
		window.addEventListener('load', function()
		{
			if(unsafeWindow.gmonkey)
			{
				unsafeWindow.gmonkey.load('1.0', function(g)
				{
					window.setTimeout(function()
					{
						GmailAddons.registerAddonInt(add)
					}, 0);
				});
			}
		}, true);
	},
	
	//id, name, url, position, width/height, openOnLoad, indicatorLabel, insideMainFrame, callback
	registerAddonInt: function(add)
	{
		var a = this.addons;
		a[a.n] = add;
		a[a.n].processed = false;
		a.n++;
		this.installAddons();
	},
	
	installAddons: function()
	{
		if (this.interfaceReady()) 
		{
			this.fGmail.style.cssFloat = 'left';
			
			this.gm.getActiveViewElement().firstChild.style.overflow='auto';
			this.gm.getActiveViewElement().firstChild.style.marginBottom='5px';
			
			if (FIX_TOGGLE_BAR) 
			{
				if (this.gbar) //new gmail bar
				{
					this.gbar.style.position = 'fixed';
					this.gbar.style.zIndex = '999';
					this.gbar.style.backgroundColor = '#ffffff';
				}
			}
		}
		else 
		{
			window.setTimeout(function()
			{
				GmailAddons.installAddons();
			}, 500);
			return;
		}
		
		var doc = this.fGmail.contentDocument;
		var a = this.addons;
		for (var i = 0; i < a.n; i++) 
		{
			if (!a[i].processed) 
			{
				//if its the preferences addon save it for later
				if(a[i].id=='GmailAddonsPreferences') this.prefs=a[i];
				//set defaults
				if (!(typeof a[i].id == 'undefined')) 
				{
					for(var j=0;j<this.addonProperties.length;j++)
					{
						a[i][this.addonProperties[j]] = GM_getValue(a[i].id+this.addonProperties[j],a[i][this.addonProperties[j]]);
					}
				}
				if (typeof a[i].name == 'undefined') a[i].name = 'GmailAddon' + i;
				if (typeof a[i].url == 'undefined') a[i].url = 'about:blank';
				
				if (typeof a[i].position == 'undefined') a[i].position = DEFAULT_POSITION;
				if (typeof a[i].width == 'undefined') a[i].width = DEFAULT_WIDTH;
				if (typeof a[i].height == 'undefined') a[i].height = DEFAULT_HEIGHT;
				if (typeof a[i].openOnLoad == 'undefined') a[i].openOnLoad = false;
				if (typeof a[i].indicatorLabel == 'undefined' ||
				    a[i].indicatorLabel=='null' ||
					a[i].indicatorLabel=='') a[i].indicatorLabel = null;
				if (typeof a[i].insideMainFrame == 'undefined') a[i].insideMainFrame = false;
				if (typeof a[i].shortcutKey == 'undefined' || a[i].shortcutKey == '') a[i].shortcutKey = '';
				
				a[i].open = a[i].openOnLoad;
				
				//create content area
				{
					var f = ( a[i].insideMainFrame ? doc.createElement('iframe') : top.document.createElement('iframe') );
					f.id = a[i].id;
					f.src = a[i].url;
					f.setAttribute('frameborder', 0);
					if (a[i].position == 'left') 
					{
						f.style.cssFloat = 'left';
						f.style.height = '100%';
						f.style.width = '0';
						this.fGmail.parentNode.insertBefore(f, this.fGmail);
					}
					else 
						if (a[i].position == 'right') 
						{
							f.style.cssFloat = 'right';
							f.style.height = '100%';
							f.style.width = '0';
							this.fGmail.parentNode.insertBefore(f, this.fGmail.nextSibling);
						}
						else 
							if (a[i].position == 'bottom') 
							{
								f.style.height = '0';
								f.style.width = '100%';
								if (!a[i].insideMainFrame) 
								{
									f.style.cssFloat = 'right';
									this.fGmail.parentNode.insertBefore(f, this.fGmail.nextSibling);
								}
								else 
								{
																		//make an inline toggle line
									{
										var inlineToggle = doc.createElement('div');
										inlineToggle.addEventListener('click', new Function('GmailAddons.toggleAddonOpen(' + i + ')'), true);
										a[i].inlineToggle = inlineToggle;
										this.gm.getActiveViewElement().appendChild(inlineToggle);
									}
									
									this.gm.getActiveViewElement().appendChild(f);
								}
							}
					
					a[i].f = f;
				}
				
				//Add status indicator in google bar
				a[i].statusIndicator=null;
				try//non critical, might not work if google changes something small
 				{
					if (a[i].indicatorLabel) 
					{
						if (this.gbar) //new gmail bar
						{
							var gbarNodes = this.gbar.firstChild.childNodes[0];
							var statusIndicator;
							while (gbarNodes)//if same named indicator found replace it
 							{
								if (
									gbarNodes.tagName == 'SPAN' &&
									gbarNodes.firstChild.tagName == 'A' &&
									gbarNodes.firstChild.firstChild.nodeValue == a[i].indicatorLabel
									) 
								{
									statusIndicator = gbarNodes.firstChild;
									statusIndicator.addEventListener('click', function(e)
									{
										e.preventDefault();
									}, false);
									statusIndicator.addEventListener('click', new Function('GmailAddons.toggleAddonOpen(' + i + ')'), true);
									statusIndicator.href = '#';
									statusIndicator.style.color = '#000000';
									statusIndicator.style.fontWeight = 'bold';
									break;
								}
								gbarNodes = gbarNodes.nextSibling;
							}
							if (!gbarNodes)//same name not found
							{
								var link = doc.createElement('span');
								link.setAttribute('class', 'gb1');
								statusIndicator = doc.createElement('a');
								statusIndicator.addEventListener('click', function(e)
								{
									e.preventDefault();
								}, false);
								statusIndicator.addEventListener('click', new Function('GmailAddons.toggleAddonOpen(' + i + ')'), true);
								statusIndicator.href = '#';
								statusIndicator.style.color = '#000000';
								statusIndicator.style.fontWeight = 'bold';
								statusIndicator.appendChild(doc.createTextNode(a[i].indicatorLabel));
								link.appendChild(statusIndicator);
								//add to DOM
								this.gbar.firstChild.insertBefore(link, this.gbar.firstChild.childNodes[1]);
							}
							a[i].statusIndicator = statusIndicator;
						}
						else if(this.gbarapps)//old gmail bar
						{
							var gbarNodes = this.gbarapps.childNodes[0];
							var statusIndicator;
							while(gbarNodes)//if same name found replace it
							{
								if(gbarNodes.tagName=='A' && gbarNodes.firstChild.nodeValue==a[i].indicatorLabel)
								{
									statusIndicator=gbarNodes;
									statusIndicator.addEventListener('click', function(e)
									{
										e.preventDefault();
									}, false);
									statusIndicator.addEventListener('click', new Function('GmailAddons.toggleAddonOpen(' + i + ')'), true);
									statusIndicator.href = '#';
									statusIndicator.style.color = '#000000';
									statusIndicator.style.fontWeight = 'bold';
									break;
								}
								gbarNodes = gbarNodes.nextSibling;
							}
							if (!gbarNodes)//same name not found
							{
								statusIndicator = doc.createElement('a');
								statusIndicator.addEventListener('click', function(e)
								{
									e.preventDefault();
								}, false);
								statusIndicator.addEventListener('click', new Function('GmailAddons.toggleAddonOpen(' + i + ')'), true);
								statusIndicator.href = '#';
								statusIndicator.style.color = '#000000';
								statusIndicator.style.fontWeight = 'bold';
								statusIndicator.appendChild(doc.createTextNode(a[i].indicatorLabel));
								//add to DOM
								this.gbarapps.insertBefore(statusIndicator, this.gbarapps.childNodes[3]);
								var space=doc.createElement('span');space.innerHTML='&nbsp;&nbsp;&nbsp';
								this.gbarapps.insertBefore(space, this.gbarapps.childNodes[3])
							}
							a[i].statusIndicator=statusIndicator;
						}
						
					}//if a[i].indicatorLabel
				}
				catch (e) 
				{
					log('ERROR IN TOOLBAR STATUS INDICATOR');
				}
				
				// little shortcut thing
				{
					if(i==0) //do it only once
					{
						this.fGmail.contentWindow.addEventListener('keydown', function(e)
						{
							var n = GmailAddons.shortcutKeyToNumber[String.fromCharCode(e.keyCode)];
							if(n) GmailAddons.toggleAddonOpen(n);
						}, true);
					}
					// add the shortcut key to the key value pairs
					if(a[i].shortcutKey!='')
					{
						this.shortcutKeyToNumber[a[i].shortcutKey] = i;
					}
				}
				
				//add GM_registerMenuCommand for people with Foreign Languages ??
				if (!(a[i].id == 'GmailAddonsPreferences'))
				{
					GM_registerMenuCommand('Toggle ' + a[i].name, new Function('GmailAddons.toggleAddonOpen(' + i + ')'));
				}
				
				//mark flag as processed so we dont do this addon again later
				a[i].processed = true;
				
				if(typeof a[i].callback != 'undefined')
				{
					a[i].callback(a[i]);
				}
				
			}//if(!a[i].processed)
		}//for to run through everything
		
		for (i = 0; i < a.n; i++) 
		{
			//remove all right frames and reinsert immediately after fGmail		
			//(weird float problem)
			//when some addons have their own 'bottom' frame
			if (a[i].position == 'right') 
			{
				this.fGmail.parentNode.removeChild(a[i].f);
				this.fGmail.parentNode.insertBefore(a[i].f, this.fGmail.nextSibling);
			}
		}
		
		this.updateInterface();
		
	},//installAddons();
	updateInterface: function()
	{
		var a = this.addons;
		var h = 100; //height and width of fGmail
		var w = 100;
		var outerBottomFrame = false; //where any bottom addon (if open) uses its frame
		var innerBottomFrame = false;
		var i;
		for (i = 0; i < a.n; i++) 
		{
			if (a[i].position != 'bottom') 
			{
				if (a[i].open == true) 
				{
					a[i].f.style.width = a[i].width + '%';
					w -= a[i].width;
				}
				else 
					a[i].f.style.width = '0';
			}
		}
		for (i = 0; i < a.n; i++) 
		{
			if (a[i].position == 'bottom') 
			{
				if(!a[i].insideMainFrame) a[i].f.style.width = w + '%';
				if (a[i].open == true)
				{
					a[i].f.style.height = a[i].height + (!a[i].insideMainFrame?'%':'px');
					if (!a[i].insideMainFrame) 
					{
						outerBottomFrame=true;
						h -= a[i].height;
					}
					if (a[i].insideMainFrame) 
					{
						innerBottomFrame = true;
					}
				}
				else 
					a[i].f.style.height = 0;
			}
		}
		for (i = 0; i < a.n; i++) 
		{
			if (a[i].statusIndicator) 
			{
				if (a[i].open) 
					a[i].statusIndicator.style.textDecoration = 'none';
				else 
					a[i].statusIndicator.style.textDecoration = 'underline';
			}
			if(a[i].inlineToggle)
			{
				if(!a[i].open)
				{
					a[i].inlineToggle.innerHTML=
											'<div style="background-color: #FFFFFF; height: 14px; margin: 0 -2px; margin-top: 2px;">&nbsp;</div>' +
											'<div style="height: 20px; color: #000000; cursor: pointer; font-size: 80%;">' +
											'<div style="width: 11px; height: 11px; margin-top: 4px; background-image:url(images/2/5/c/mailicons4.png); background-position: 0px -20px;"></div>' +
											'<div style="margin-top: -11px; margin-left: 15px;">'+a[i].name+'</div>' +
											'</div>';
				}
				else
				{
					a[i].inlineToggle.innerHTML=
											'<div style="background-color: #FFFFFF; height: 14px; margin: 0 -2px; margin-top: 2px;">&nbsp;</div>' +
											'<div style="height: 20px; color: #000000; cursor: pointer; font-size: 80%;">' +
											'<div style="width: 11px; height: 11px; margin-top: 4px; background-image:url(images/2/5/c/mailicons4.png); background-position: -40px -20px;"></div>' +
											'<div style="margin-top: -11px; margin-left: 15px;">'+a[i].name+'</div>' +
											'</div>';
				}
			}
		}
		
		this.fGmail.style.width = w + '%';
		this.fGmail.style.height = h + '%';
		if (innerBottomFrame && COLLAPSE_MAIL && this.gm.getActiveViewType()!='cv' && this.gm.getActiveViewType()!='s' && this.gm.getActiveViewType()!='co' && this.gm.getActiveViewType()!='ct') 
		{
			this.gm.getActiveViewElement().firstChild.style.height = COLLAPSED_MAIL_HEIGHT + 'px';
		}
		else 
		{
			this.gm.getActiveViewElement().firstChild.style.height = 'auto';
		}
	},
	
	toggleAddonOpen: function(n)
	{
		var a = this.addons;
		a[n].open = !a[n].open;
		//if its a bottom addon that uses its own frame then close all other bottom addons that use their own frames
		if(a[n].open && a[n].position=='bottom' && !a[n].insideMainFrame)
			for(var i=0;i<a.n;i++)
				if(i!=n && a[i].position=='bottom' && !a[i].insideMainFrame) a[i].open=false;
		this.updateInterface();
	},
	
	initGmailAddonsPreferences: function()
	{
		var doc=GmailAddons.prefs.f.contentDocument;
		var ap=GmailAddons.addonProperties;
		var apn=GmailAddons.addonPropertiesNames;
		
		doc.getElementsByTagName('html')[0].innerHTML='<head></head><body><div id="content" style="font-size: 80%; font-family: arial, verdana;"><br/><div style="font-size: 120%; font-weight: bold;">Gmail Addon Preferences</div><br/></div></body>';
		var con=doc.getElementById('content');
		
		var a=GmailAddons.addons;
		
		for(var i=0;i<a.n;i++)
		{
			var space=doc.createElement('div');
			space.innerHTML='<br/>'
			con.appendChild(space);
			if (a[i].id) 
			{
				var addonDiv = doc.createElement('div');
				addonDiv.innerHTML = '<div style="font-weight: bold;">' + a[i].name + '</div>';
				var div;
				for(var j=0;j<ap.length;j++)
				{
					div=doc.createElement('div');
					div.innerHTML=apn[j] + '&nbsp;&nbsp;&nbsp;<input type="text" id="' + a[i].id + ap[j] + '" value="' + GM_getValue(a[i].id+ap[j], a[i][ap[j]]) + '" />';
					addonDiv.appendChild(div);
				}
				con.appendChild(addonDiv);
			}
		}
		
		var save=doc.createElement('input');
		con.appendChild(save);
		save.type='button';
		save.value='Save';
		save.addEventListener('click', function()
		{
			var doc=GmailAddons.prefs.f.contentDocument;
			var inputs=doc.getElementsByTagName('input');
			
			var a=GmailAddons.addons;
			
			for(var i=0;i<inputs.length;i++)
			{
				if (inputs[i].type == 'text') 
				{
					if (inputs[i].value == 'true') 
						GM_setValue(inputs[i].id, true);
					else 
						if (inputs[i].value == 'false') 
							GM_setValue(inputs[i].id, false);
						else 
							GM_setValue(inputs[i].id, inputs[i].value);
				}
			}
			
			GmailAddons.prefs.open=false;
			GmailAddons.updateInterface();
		},false);
		
		var cancel=doc.createElement('input');
		con.appendChild(cancel);
		cancel.type='button';
		cancel.value='Cancel';
		cancel.addEventListener('click', function()
		{
			GmailAddons.prefs.open=false;
			GmailAddons.updateInterface();
		}, false);
		
		GmailAddons.prefs.open=true;
		GmailAddons.updateInterface();
	},
	
	shortcutKeyToNumber: {} // key value pairs to speed up resolution of shortcut key to addon number
	
};

function log(str)
{
	GM_log(str);
}

window.addEventListener('load', function()
{
	if(unsafeWindow.gmonkey)
	{
		unsafeWindow.gmonkey.load('1.0', function(g)
		{
			GmailAddons.gm=g;
			GmailAddons.gm.registerViewChangeCallback(function()
			{
				GmailAddons.gmailViewChange();
			});
		});
	}
}, true);

/////////// INSTALL SPECIFIC ADDONS

	GmailAddons.registerAddon(
	{
		id: 'GmailAddonsPreferences',
		name: 'Gmail Addons Preferences',
		indicatorLabel: 'Prefs',
		position: 'right',
		width: 30,
		openOnLoad: false,
		callback: function()
		{
			if(GmailAddons.prefs.statusIndicator)
				GmailAddons.prefs.statusIndicator.addEventListener('click', function()
				{
					GmailAddons.initGmailAddonsPreferences();
				}, true);
			GM_registerMenuCommand('! Gmail Addons Preferences', function()
			{
				GmailAddons.initGmailAddonsPreferences();
			});
		}
	});
	GmailAddons.registerAddon(
	{
		id: 'tdGCal',
		name: 'Google Calendar',
		url: 'https://www.google.com/calendar',
		indicatorLabel: 'Calendar'
	});
	GmailAddons.registerAddon(
	{
		id: 'tdGChat',
		name: 'Google Chat',
		url: 'http://talkgadget.google.com/talkgadget/client',
		indicatorLabel: 'Chat',
		position: 'right'
	});

