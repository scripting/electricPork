var appConsts = {
	productname: "littlePorkChop",
	productnameForDisplay: "Little Pork Chop",
	domain: "pork.io", 
	urlTwitterServer: "http://twitter.porkchop.io/", //5/23/15 by DW
	urlChangeNotes: "http://scripting.com/2017/03/22/whatsNewInElectricPork061.html",
	flElectronShell: false, //2/20/17 by DW
	version: "1.5.0"
	}
var appPrefs = {
	flReverseChronologicOrder: false, 
	flSendToFatFeed: true, 
	stringAfterNumber: "/", 
	ctSecsBetwTweets: 1, 
	hashTag: "", 
	flIncludeTotalTweets: true,
	flLinkWarningReceived: false,
	flPublishRss: true, rssTitle: "", rssLink: "", rssDescription: "", rssMaxHistory: 50, rssHistory: [], flRssPrefsInitialized: false, rssFeedUrl: ""
	}
var history = { //6/18/14 by DW
	messages: []
	}
var maxHistory = 25; //we only remember the last 25 tweets in localStorage
var flAddIdToHistory = false; //if true, next tweet adds the ID of the tweet to the most recent message in the history array
var maxTweetLength = 280, maxTweetsInOneStorm = 25;
var twittericon = "<i class=\"fa fa-twitter\" style=\"color: #4099FF; font-weight: bold;\"></i>";
var infoicon = "<i class=\"fa fa-info-circle\"></i>";
var tweetArray;
var flTweeting = false, ixNextItemToTweet, idLastTweet = 0, lastTweetData;
var whenLastKeystroke = new Date (), whenLastGooglePing = new Date ();
var lastTextArrayContents = "";
var twitterUserInfo;
var maxTweetsPerStorm = 25, flMaxTweetsError = false; //4/3/15 by DW
var flUnlimitedTweetsPerStorm = true; //3/14/17 by DW

var idTextArea = "#idMainTextArea";
var idTweetArray = "#idTweetArray";
var idTweetButton = "#idTweetButton";
var idProductName = "#idProductName";
var idTwitterButton = "#idTwitterButton";
var idScreenName = "#idScreenName";

var whenLastTweet = new Date ();
var urlPrefsDialogHtml = "http://pork.io/code/prefsdialog.html";

function initAppPrefs () {
	if (appPrefs.flReverseChronologicOrder == undefined) { //6/7/14 by DW
		appPrefs.flReverseChronologicOrder = false;
		}
	if (appPrefs.flSendToFatFeed == undefined) { //6/8/14 by DW
		appPrefs.flSendToFatFeed = true;
		}
	if (appPrefs.stringAfterNumber == undefined) { //6/8/14 by DW
		appPrefs.stringAfterNumber = "/";
		}
	if (appPrefs.ctSecsBetwTweets == undefined) { //6/9/14 by DW
		appPrefs.ctSecsBetwTweets = 1;
		}
	if (appPrefs.hashTag == undefined) { //6/15/14 by DW
		appPrefs.hashTag = "";
		}
	if (appPrefs.flIncludeTotalTweets == undefined) { //6/17/14 by DW
		appPrefs.flIncludeTotalTweets = true;
		}
	}
function linkWarning () { //11/1/17 by DW
	if (!appPrefs.flLinkWarningReceived) {
		alertDialog ("Please don't use links in your posts.\rWe can't detect them, and they affect the length of a tweet. Twitter may reject it, which of course is not good. You should only see this message once.");
		appPrefs.flLinkWarningReceived = true;
		prefsToStorage ();
		}
	}
function isReverseChronologicOrder () { //3/17/17 by DW
	return (false);
	}
function sendToFatFeed (text) { //6/8/14 by DW
	var apiUrl = urlDefaultServer + "fatfeed?oauth_token=" + encodeURIComponent (localStorage.twOauthToken) + "&oauth_token_secret=" + encodeURIComponent (localStorage.twOauthTokenSecret) + "&text=" + encodeURIComponent (stripMarkup (text));
	console.log ("sendToFatFeed: " + apiUrl);
	$.ajax({
		type: "GET",
		url: apiUrl,
		success: function (data) {
			console.log ("sendToFatFeed: result == " + JSON.stringify (data));
			},
		dataType: "json"
		});
	}
function applyPrefs () {
	recalcTweetArray (true);
	}
function saveHistory () {
	prefsToStorage ();
	}
function addToHistory (usersText) {
	var obj = new Object (), now = new Date ();
	if (usersText == undefined) {
		usersText = getUsersText ();
		}
	obj.text = usersText;
	obj.when = now;
	obj.screenname = localStorage.twScreenName;
	
	appPrefs.rssHistory.unshift (obj);
	while (appPrefs.rssHistory.length > appPrefs.rssMaxHistory) { //keep array within max size
		appPrefs.rssHistory.pop ();
		}
	
	prefsToStorage ();
	}
function uploadFeed (xmltext, callback) {
	console.log ("uploadFeed: twStorageData.urlTwitterServer == " + twStorageData.urlTwitterServer + ", localStorage.twOauthToken == " + localStorage.twOauthToken + ", localStorage.twOauthTokenSecret == " + localStorage.twOauthTokenSecret);
	twUploadFile ("rss.xml", xmltext, "text/xml", false, function (data) {
		console.log ("uploadFeed: data == " + jsonStringify (data));
		appPrefs.rssFeedUrl = data.url;
		prefsToStorage ();
		if (callback !== undefined) {
			callback (data);
			}
		});
	}

function lpcBuildRssFeed () {
	var headElements = {
		title: appPrefs.rssTitle,
		link: appPrefs.rssLink,
		description: appPrefs.rssDescription,
		language: "en-us",
		generator: appConsts.productnameForDisplay + " v" + appConsts.version,
		docs: "http://cyber.law.harvard.edu/rss/rss.html",
		twitterScreenName: localStorage.twScreenName,
		maxFeedItems: appPrefs.rssMaxHistory,
		appDomain: appConsts.domain,
		
		flRssCloudEnabled:  true,
		rssCloudDomain:  rssCloudDefaults.domain,
		rssCloudPort:  rssCloudDefaults.port,
		rssCloudPath:  rssCloudDefaults.path,
		rssCloudRegisterProcedure:  "",
		rssCloudProtocol:  "http-post"
		}
	var xmltext = buildRssFeed (headElements, appPrefs.rssHistory);
	uploadFeed (xmltext, function () {
		rssCloudPing (undefined, appPrefs.rssFeedUrl);
		});
	}

function getPrefixString (num, totalTweets) {
	var totalString = "";
	if (appPrefs.flIncludeTotalTweets && (totalTweets > 0)) {
		totalString = totalTweets.toString () + " ";
		}
	return (num + appPrefs.stringAfterNumber + totalString);
	}

function wordLength (word) { //7/15/14 by DW
	var splitUrl = urlSplitter (word);
	if ((splitUrl.host != undefined) && (splitUrl.path != undefined)) {
		var flHasDot = false;
		for (var i = 0; i < splitUrl.host.length; i++) {
			if (splitUrl.host [i] == ".") {
				flHasDot = true;
				break;
				}
			}
		if (flHasDot) {
			return (twGetUrlLength ()); //3/13/17 by DW
			}
		}
	return (word.length);
	}

function splitIntoTweetArray (s) {
	function doSplit () {
		var pgfs = removeMultipleBlanks (s).split ("\n"), totalTweets, nextPrefix, hashtag, tagLength, nextTweet = "";
		
		//set totalTweets, nextPrefix -- 6/17/14 by DW
			if (tweetArray == undefined) {
				totalTweets = 0;
				}
			else {
				totalTweets = tweetArray.length;
				}
			nextPrefix = getPrefixString (1, totalTweets);
		
		tweetArray = new Array ();
		//set hashtag, tagLength -- 6/15/14 by DW
			hashtag = trimWhitespace (appPrefs.hashTag);
			if (hashtag.length == 0) {
				hashtag = "";
				tagLength = 0;
				}
			else {
				if (!beginsWith (hashtag, "#")) {
					hashtag = "#" + hashtag;
					}
				hashtag = " " + hashtag;
				tagLength = hashtag.length;
				}
		function newTweet () {
			var obj = new Object ();
			obj.text = nextPrefix + nextTweet + hashtag;
			
			if (flUnlimitedTweetsPerStorm || (tweetArray.length < maxTweetsPerStorm)) { //4/3/15 by DW
				tweetArray [tweetArray.length] = obj;
				}
			else {
				flMaxTweetsError = true;
				}
			
			nextPrefix = getPrefixString (tweetArray.length + 1, totalTweets);
			nextTweet = "";
			}
		for (var ixpgf = 0; ixpgf < pgfs.length; ixpgf++) {
			var pgf = pgfs [ixpgf], words = pgf.split (" ");
			for (ixword = 0; ixword < words.length; ixword++) {
				var w = words [ixword];
				var blankLength = (nextTweet.length > 0) ? 1 : 0;
				if ((wordLength (w) + nextTweet.length + nextPrefix.length + blankLength + tagLength) > maxTweetLength) {
					newTweet ();
					
					//protect against weirdly-long words -- 6/7/14 by DW
						var maxwordlength = maxTweetLength - nextPrefix.length;
						while (w.length > maxwordlength) {
							nextTweet = w.substr (0, maxwordlength);
							w = w.substr (maxwordlength);
							newTweet ();
							}
					
					nextTweet = w;
					}
				else {
					if (nextTweet.length > 0) {
						nextTweet += " ";
						}
					nextTweet += w;
					}
				}
			if (nextTweet.length > 0) {
				newTweet ();
				}
			}
		}
	doSplit ();
	if (appPrefs.flIncludeTotalTweets) { 
		doSplit ();
		}
	}
function viewTweetArray (ixBoldItem) {
	var htmltext = "";
	for (var i = 0; i < tweetArray.length; i++) {
		var theTweet = tweetArray [i], s = theTweet.text;
		s = replaceAll (s, "<", "&lt;"); //6/7/14 by DW
		
		if ((theTweet.id != undefined) && (localStorage.twScreenName != undefined)) {
			var url = "http://twitter.com/" + localStorage.twScreenName + "/status/" + theTweet.id;
			
			
			s = "<a onclick=\"openUrl ('" + url + "')\">" + s + "</a>";
			
			
			
			}
		
		if (i === ixBoldItem) {
			s = "<b>" + s + "</b>";
			}
		htmltext += "<p>" + s + "</p>";
		}
	$(idTweetArray).html (htmltext);
	}
function setCharCount () {
	}
function setTweetButtonText () {
	var s, len = tweetArray.length;
	if (len == 0) {
		s = "Nothing to tweet yet";
		}
	else {
		s = "Post " + len + " Tweet";
		if (len > 1) {
			s += "s";
			}
		}
	$(idTweetButton).html (s);
	}
function getUsersText () {
	return ($(idTextArea).val ());
	}
function recalcTweetArray (flMustRecalc) {
	var s = getUsersText ();
	if (flMustRecalc == undefined) {
		flMustRecalc = false;
		}
	if ((s != lastTextArrayContents) || flMustRecalc) {
		splitIntoTweetArray (s);
		viewTweetArray ();
		setCharCount ();
		localStorage.lastTweetText = s;
		lastTextArrayContents = s;
		whenLastKeystroke = new Date ();
		}
	}
function sendOneTweet (theTweet, idInReplyTo, callback) {
	if (appConsts.flElectronShell) {
		if (idInReplyTo == 0) {
			idInReplyTo = undefined;
			}
		twTweet (theTweet.text, idInReplyTo, function (tweetData) {
			if (callback !== undefined) {
				callback (undefined, tweetData);
				}
			});
		}
	else {
		twTweet (theTweet.text, idInReplyTo, function (tweetData) {
			if (callback !== undefined) {
				callback (undefined, tweetData);
				}
			});
		}
	}
function sendNextTweet () {
	var now = new Date ();
	if (flTweeting) {
		if (secondsSince (whenLastTweet) >= appPrefs.ctSecsBetwTweets) { //6/9/14 by DW
			function tweetNext () {
				var theTweet = tweetArray [ixNextItemToTweet];
				whenLastTweet = now;
				console.log ("sendNextTweet: theTweet.text == " + theTweet.text);
				viewTweetArray (ixNextItemToTweet);
				sendOneTweet (theTweet, idLastTweet, function (err, tweetData) {
					if (err) {
						var theMessage = "";
						try {theMessage = JSON.parse (err.data).errors [0].message;} catch (err) {};
						alertDialog ("There was an error sending the tweet. " + theMessage);
						flTweeting = false; //tweeting stops after error -- 3/4/17 by DW
						viewTweetArray (); //take the bold off the item that caused the error -- 3/4/17 by DW
						}
					else {
						lastTweetData = tweetData; //for debugging
						idLastTweet = tweetData.id_str;
						
						if (theTweet.id === undefined) {
							theTweet.id = tweetData.id_str;
							if (flAddIdToHistory) { //6/18/14 by DW
								
								var itemLink = "https://twitter.com/" + localStorage.twScreenName + "/status/" + idLastTweet;
								appPrefs.rssHistory [0].link = itemLink;
								appPrefs.rssHistory [0].guid = {
									value: itemLink,
									flPermalink: true
									};
								appPrefs.rssHistory [0].id = idLastTweet;
								
								flAddIdToHistory = false; //consume
								prefsToStorage ();
								}
							}
						else {
							console.log ("sendNextTweet: caught it trying to overwrite " + theTweet.id + " with " + tweetData.id_str);
							}
						
						console.log ("sendNextTweet: theTweet.text == " + theTweet.text + " (after sending the tweet)");
						}
					});
				}
			function endTweets () {
				if (flTweeting) {
					viewTweetArray (); //with nothing bold
					flTweeting = false;
					idLastTweet = 0; //first tweet in next sequence is in reply to nothing
					$(idTextArea).select (); //select all the text for easy deleting
					if (appPrefs.flPublishRss) {
						lpcBuildRssFeed ();
						}
					}
				}
			if (isReverseChronologicOrder ()) {
				if (ixNextItemToTweet >= 0) {
					tweetNext ();
					ixNextItemToTweet--;
					}
				else {
					endTweets ();
					}
				}
			else {
				if (ixNextItemToTweet < tweetArray.length) {
					tweetNext ();
					ixNextItemToTweet++;
					}
				else {
					endTweets ();
					}
				}
			}
		}
	}
function startTweeting () {
	function doStart () {
		var s = getUsersText ();
		addToHistory (s); //6/18/14 by DW
		flAddIdToHistory = true; //6/18/14 by DW
		if (isReverseChronologicOrder ()) {
			ixNextItemToTweet = tweetArray.length - 1;
			}
		else {
			ixNextItemToTweet = 0;
			}
		flTweeting = true;
		whenLastTweet = new Date (new Date () - appPrefs.ctSecsBetwTweets * 60 * 1000); //so the first one goes out right away
		}
	if (appConsts.flElectronShell) {
		doStart ();
		}
	else {
		if (twIsTwitterConnected ()) {
			twUserWhitelisted (localStorage.twScreenName, function (flwhitelisted) {
				if (flwhitelisted) {
					doStart ();
					return;
					}
				else {
					alertDialog ("Can't post because \"" + localStorage.twScreenName + "\" is not whitelisted.");
					}
				});
			}
		}
	}
function updateTwitterButton () {
	var buttontext = (twIsTwitterConnected ()) ? "Sign off Twitter" : "Sign on Twitter";
	$(idTwitterButton).html (twittericon + " " + buttontext);
	
	//set screen name
		var name = localStorage.twScreenName;
		var url = "http://twitter.com/" + name;
		var script = "openUrl ('" + url + "')";
		var linktoname = "<a onclick=\"" + script + "\">" + name + "</a>"
		linktoname = (twIsTwitterConnected ()) ? linktoname : "";
		$(idScreenName).html (linktoname);
	}
function showAboutDialog () {
	$('#idInfoDialog').modal ("show");
	}
function showPrefsDialog () {
	prefsDialogShow ();
	}
function openUrl (url) {
	if (appConsts.flElectronShell) {
		shell.openLinkInExternalWindow (url);
		}
	else {
		window.open (url);
		}
	}
function toggleConnect () {
	if (appConsts.flElectronShell) {
		shell.toggleTwitterConnect ()
		}
	else {
		twToggleConnectCommand ();
		}
	}
function loadPrefsDialogHtml () { //3/9/17 by DW
	readHttpFile (urlPrefsDialogHtml, function (htmltext) {
		if (htmltext === undefined) { 
			console.log ("loadPrefsDialogHtml: error loading the HTML.");
			}
		else {
			console.log ("loadPrefsDialogHtml: htmltext.length == " + htmltext.length);
			$("#idPrefsDialogPlace").html (htmltext);
			}
		});
	}
function porkChopEverySecond () {
	sendNextTweet ();
	recalcTweetArray ();
	updateTwitterButton ();
	setTweetButtonText ();
	$(idTextArea).autoGrow (); //3/11/17 by DW
	if (flMaxTweetsError) {
		flMaxTweetsError = false;
		alertDialog ("Too many tweets in this storm. Maximum is " + maxTweetsPerStorm + ".");
		}
	}
function porkChopGetUserInfo () {
	twGetUserInfo (localStorage.twScreenName, function (userData) {
		twitterUserInfo = userData;
		if (!appPrefs.flRssPrefsInitialized) {
			appPrefs.rssTitle = twitterUserInfo.name;
			appPrefs.rssDescription = twitterUserInfo.description;
			appPrefs.flRssPrefsInitialized = true;
			appPrefs.rssLink = "https://twitter.com/" + localStorage.twScreenName;
			prefsToStorage ();
			}
		console.log ("porkChopGetUserInfo: twitterUserInfo == " + jsonStringify (twitterUserInfo));
		});
	}
function porkChopStartup (options) {
	function updateVersionNumber () {
		var s = "v" + appConsts.version;
		if (appConsts.urlChangeNotes.length > 0) {
			
			var theScript = "openUrl ('" + appConsts.urlChangeNotes + "')";
			s = "<a onclick=\"" + theScript + "\">" + s + "</a>";
			
			}
		$("#idVersionNumber").html (s);
		}
	for (var x in options) {
		appConsts [x] = options [x];
		}
	console.log ("porkChopStartup: appConsts == " + jsonStringify (appConsts));
	twStorageData.urlTwitterServer = appConsts.urlTwitterServer; //1/16/16 by DW
	urlDefaultServer = appConsts.urlTwitterServer; //"http://twitter.porkchop.io/";
	//check if we're starting up on a phone
		function hideSection (id) {
			document.getElementById  (id).style.display = "none";
			}
		if ($("#idTellTalePart").css ("visibility") == "visible") { //phone version -- 6/8/14 by DW
			idTextArea = "#idPhoneTextArea";
			idTweetArray = "#idPhoneTweetArray";
			idTweetButton = "#idPhoneTweetButton";
			idProductName = "#idPhoneProductName";
			idTwitterButton = "#idPhoneTwitterButton";
			idScreenName = "#idPhoneScreenName";
			
			hideSection ("idTextAndControls");
			}
		else {
			hideSection ("idPhoneTextAndControls");
			}
	storageToPrefs ();
	
	if (appConsts.flElectronShell) { //2/20/17 by DW
		porkChopGetUserInfo ();
		}
	else {
		twGetTwitterConfig (); //7/15/14 by DW
		twGetOauthParams ();
		if (twIsTwitterConnected ()) { //7/30/14 by DW
			twUserWhitelisted (localStorage.twScreenName, function (flwhitelisted) {
				if (!flwhitelisted) {
					confirmDialog ("\"" + localStorage.twScreenName + "\" is not authorized to use this app.", function (flconfirm) {
						window.open ("http://littlepork.smallpict.com/2014/11/19/littlePorkChopComingBack.html");
						});
					}
				});
			porkChopGetUserInfo ();
			}
		}
	
	var myFakeUrl = "http://pork.io/code?v=" + appConsts.version;
	hitCounter (undefined, undefined, myFakeUrl, myFakeUrl);
	document.title = appConsts.productnameForDisplay;
	$(idProductName).html (appConsts.productnameForDisplay);
	updateVersionNumber ();
	updateTwitterButton ();
	{ //set up the text editing area
		var s = "";
		if (localStorage.lastTweetText != undefined) {
			s = localStorage.lastTweetText;
			}
		$(idTextArea).html (s);
		}
	{ //set up the tweet array
		splitIntoTweetArray (s);
		viewTweetArray ();
		}
	setCharCount ();
	setTweetButtonText ();
	$(idTextArea).autoGrow ();
	linkWarning (); //11/1/17 by DW
	porkChopEverySecond (); //3/11/17 by DW -- do the first call immediately
	self.setInterval (porkChopEverySecond, 1000); //call every second
	if (appConsts.flElectronShell) { //10/24/17 by DW
		shell.openLinksInExternalWindow ();
		}
	}
