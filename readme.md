# electricPork

An Electron app that helps you write and publish threads on Twitter.

### Background

You can <a href="http://pork.io/electric/">download</a> the app that's built from this repo. 

There are links on that page to user-level docs and a place to ask questions about using the app. Do not post questions about working on the app there, use the <a href="https://github.com/scripting/electricPork/issues">Issues section</a> of this repo.

### How to build

This is the script I use to build Electric Pork on the Mac. 

<code>sudo electron-packager . Electric-Pork --platform=darwin --arch=all --electron-version=0.37.5 --overwrite --icon=pork.icns</code>

