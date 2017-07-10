This is a starter template for [Ionic](http://ionicframework.com/docs/) projects.

## How to use this template

*This template does not work on its own*. The shared files for each starter are found in the [ionic2-app-base repo](https://github.com/ionic-team/ionic2-app-base).

To use this template, either create a new ionic project using the ionic node.js utility, or copy the files from this repository into the [Starter App Base](https://github.com/ionic-team/ionic2-app-base).

### With the Ionic CLI:

Take the name after `ionic2-starter-`, and that is the name of the template to be used when using the `ionic start` command below:

```bash
$ sudo npm install -g ionic cordova
$ ionic start myTabs tabs
```

Then, to run it, cd into `myTabs` and run:

```bash
$ ionic cordova platform add ios
$ ionic cordova run ios
```

Substitute ios for android if not on a Mac.


## What helped me writing this app

For persistent storage with PouchDB + SQLite : https://gonehybrid.com/how-to-use-pouchdb-sqlite-for-local-storage-in-ionic-2/
For PDF generation : https://gonehybrid.com/how-to-create-and-display-a-pdf-file-in-your-ionic-app/
For creating custom components : https://www.joshmorony.com/custom-components-in-ionic-2/
For doin 2-way data-binding in custom components : https://blog.thoughtram.io/angular/2016/10/13/two-way-data-binding-in-angular-2.html
