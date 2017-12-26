# electricPork

An Electron app that helps you write and publish threads on Twitter.

### Background

You can <a href="http://pork.io/electric/">download</a> the app that's built from this repo. 

There are links on that page to user-level docs and a place to ask questions about using the app. Do not post questions about working on the app there, use the <a href="https://github.com/scripting/electricPork/issues">Issues section</a> of this repo.

### How to build

1. cd &lt;the directory with the electricPork code>

2. npm install

3. sudo electron-packager . "Electric Pork" --platform=darwin --arch=all --electron-version=0.37.5 --overwrite --icon=pork.icns

There should be an Electric Pork sub-directory, with an app inside. You can copy that anywhere, or run it from that location.

