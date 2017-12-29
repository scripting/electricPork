# electricPork

An Electron app that helps you write and publish threads on Twitter.

### Download the app

You can <a href="http://pork.io/electric/">download</a> the app that's built from this repo. 

There are links on that page to user-level docs and a place to ask questions about using the app. Do not post questions about working on the app there, use the <a href="https://github.com/scripting/electricPork/issues">Issues section</a> of this repo.

### Why release Electric Pork as open source?

There are two reasons, the second much more important than the first.

1. Writing and publishing threads on Twitter is a big deal. Twitter is adding the feature to the core product, but Electric Pork is more of an editor, it automates a bunch of things that Twitter makes you do by hand, such as wrapping tweets, numbering them, adding hash tags. It also creates an RSS feed of your threads, so they can be shared with other environments. Making the functionality open source means it can evolve in different ways, it could get interesting.

2. It's a demo app for the <a href="https://github.com/scripting/electronLand">ElectronLand</a> package, which hides most of the details of making an app run in Electron, and making it cross-platform. So far I've only mastered creating Mac apps with ElectronLand, but I want my apps to go to Linux and Windows, and perhaps other places that Electron might be going. By releasing Electric Pork as open source, and asking that people try to port it, we will get ports of the underlying framework. And that will make other projects be cross-platform as well. It's a way of getting ElectronLand thoroughly ported, if it works. 

### Requirements

In order to build Electric Pork, you need to install three things:

1. node.js.

2. electron.

3. electron-packager.

Installing Node is easy, I've got a <a href="https://github.com/scripting/1999-project/blob/master/docs/setup.md#install-nodejs">how-to</a> for that on the 1999-project site.

I am not an expert at installing electron and electron-packager, but I've managed to do it on my systems a few times.

### How to build

0. Download or clone the project from GitHub. 

1. cd &lt;the directory with the electricPork code>

2. npm install

3. sudo electron-packager . "Electric Pork" --platform=darwin --arch=all --electron-version=0.37.5 --overwrite --icon=pork.icns

There should be an Electric Pork sub-directory, with an app inside. You can copy that anywhere, or run it from that location.

