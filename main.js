const electronland = require ("electronland").main; 

var myConfig = {
	productname: "electricPork",
	productnameForDisplay: "Electric Pork",
	description: "The fastest way to tweet a storm, on your desktop.",
	version: "1.5.0",
	indexfilename: "index.html",
	flOpenDevToolsAtStart: false,
	mainWindowWidth: 1100,
	mainWindowHeight: 1000,
	appDirname: __dirname
	}

electronland.init (myConfig, function () {
	});
