const shell = require ("electronland").shell; 

function startup () {
	
	const porkChopOptions = {
		productname: "electricPork",
		productnameForDisplay: "Electric Pork",
		urlChangeNotes: "http://scripting.com/2017/03/22/whatsNewInElectricPork061.html",
		flElectronShell: true
		};
	porkChopStartup (porkChopOptions);
	
	var shellOptions = {
		};
	shell.init (shellOptions, function () {
		if (twIsTwitterConnected ()) {
			twGetUserInfo (twGetScreenName (), function (userinfo) {
				console.log ("startup: userinfo == " + jsonStringify (userinfo));
				});
			}
		});
	}
