# Feuille Jaune

"Feuille Jaune" est une application pour aider les membres de la Communauté du Chemin Neuf à faire leur feuille jaune chaque mois :)

## Setup a fresh checkout

Une fois qu'on a fait un git clone du repo, il faut faire les choses suivantes :

### Setup pdf generation correctly

Pdfmake ne marche pas directement dans ionic 2, il faut prendre la dernière build depuis le repo. Donc exécuter :
* $ cd  FeuilleJaune/www/
* $ git clone https://github.com/bpampuch/pdfmake.git
Mais il faut garder le npm install pdfmake !

Car dans index.html, on pointe vers le pdfmake.min.js et vfs_fonts.js de ce dossier-là et non l'officiel.

## Publish new version

### for PlayStore
* change version number in package.json, config.xml and param.ts
* ionic cordova plugin rm cordova-plugin-console
* ionic cordova build --release android --prod
* jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore android-release-unsigned.apk alias_name
* zipalign -v 4 android-release-unsigned.apk FeuilleJaune-vXXX.apk

Then add the APK to Github as a release

### for PWA in Firebase
* npm run ionic:build --prod
* (option) firebase reauth
* firebase deploy


## What helped me writing this app

* For persistent storage with PouchDB + SQLite : https://gonehybrid.com/how-to-use-pouchdb-sqlite-for-local-storage-in-ionic-2/
* For PDF generation : https://gonehybrid.com/how-to-create-and-display-a-pdf-file-in-your-ionic-app/ + https://stackoverflow.com/questions/42146857/how-can-use-pdfmake-in-ionic-2
* To create custom components : https://www.joshmorony.com/custom-components-in-ionic-2/
* To do 2-way data-binding in custom components : https://blog.thoughtram.io/angular/2016/10/13/two-way-data-binding-in-angular-2.html
* To generate app icon : http://blog.ionic.io/automating-icons-and-splash-screens/ (sauf que là la commande c'est ionic cordova resources)
* To do conditional formatting in Angular 2 : https://juristr.com/blog/2016/01/learning-ng2-dynamic-styles/
* To add fontawesome : https://luiscabrera.site/tech/2017/01/09/fontawesome-in-ionic2.html (not straightforward !)
* To add charts with chart.js : https://www.joshmorony.com/adding-responsive-charts-graphs-to-ionic-2-applications/
