# Feuille Jaune

"Feuille Jaune" est une application pour aider les membres de la Communauté du Chemin Neuf à faire leur feuille jaune chaque mois :)

## Setup a fresh checkout

Une fois qu'on a fait un git clone du repo, il faut faire les choses suivantes :

### Setup pdf generation correctly

Pdfmake ne marche pas directement dans ionic 3, il faut prendre la dernière build depuis le repo. Donc exécuter :

OPTION 1 :
* $ cd  FeuilleJaune/www/
* $ git clone https://github.com/bpampuch/pdfmake.git
* copier le dossier pdfmake/build dans FeuilleJaune/www/pdfmake/ et dans FeuilleJaune/www/

OPTION 2 plu simple : (mise à jour du 12/06/2018 en suivant le tuto ici : https://medium.com/@rakeshuce1990/ionic-how-to-create-pdf-file-with-pdfmake-step-by-step-75b25aa541a4)
* copier le contenu de node_modules/pdfmake/build dans FeuilleJaune/www/pdfmake/ et dans FeuilleJaune/www/

Je ne sais plus laquelle des options marche. Quoi qu'il arrive il faut garder le npm install pdfmake.

Car dans index.html, on pointe vers le pdfmake.min.js et vfs_fonts.js de ce dossier-là et non l'officiel.

## Publish new version

### for PlayStore

Voir ici : https://ionicframework.com/docs/v1/guide/publishing.html

* change version number in package.json, config.xml and param.ts
* ionic cordova plugin rm cordova-plugin-console
* `ionic cordova build --release android --prod`
* `cd platforms/android/build/outputs/apk/`
* jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-upload-key.jks android-release-unsigned.apk my-alias
* `zipalign -v 4 android-release-unsigned.apk FeuilleJaune-vXXX.apk` (zipalign devrait se trouver ici si pas dans le path : C:/Users/[user]/AppData/Local/Android/Sdk/build-tools)

Then add the APK to Github as a release

### for PWA in Firebase
* npm run ionic:build --prod
* (option) firebase reauth
* firebase deploy

### Change version number
* in config.xml
* in package.json
* in Page param.ts

## How does the custom font work ?

I used the fontastic web service to create a custom font and added it, not in /src but in /www/assets/fonts (it's called untitled-font-1). I added also the custom-font.css file in /www/assets/css to use it as font awesome classes, like <span class="my-icon"></span>. I fixed in the custom-font.css file with the right URL to the font files (added "../").

Pour utiliser la custom font, c'est un peu comme font awesome, on ajoute des balises <i></i> avec la bonne classe. Les classes de la custom font sont prefixées par "icon-", typiquement "icon-church". Mais pour que ça ne rentre pas en conflit avec les icones de Ionic, il ne faut pas prefixer avec "icon-" mais avec "myicon-" ou autre. Perso j'ai utilisé "myicon-". Pour cela j'ai édité le fichier custom-font.css.

## Useful things to know while developping

* run `ionic serve` to run the app in the browser with live reload
* run `ionic cordova run android` to run the app on your usb connected smartphone
* while developping, in index.html you should comment the service worker lines (otherwise it will cache everything and livereload won't work)

## Known bugs

* the plugin cordova-plugin-googleplus makes the android build fail, but it's necessary if I want to add "backup to Google Drive" functionality...

## What helped me writing this app

* to import JSON files with typescript's import keyword : https://medium.com/@kgrvr/reading-local-json-present-in-an-angular-2-project-733bc3dda18e
* For persistent storage with PouchDB + SQLite : https://gonehybrid.com/how-to-use-pouchdb-sqlite-for-local-storage-in-ionic-2/
* For PDF generation : https://gonehybrid.com/how-to-create-and-display-a-pdf-file-in-your-ionic-app/ + https://stackoverflow.com/questions/42146857/how-can-use-pdfmake-in-ionic-2
* To create custom components : https://www.joshmorony.com/custom-components-in-ionic-2/
* To do 2-way data-binding in custom components : https://blog.thoughtram.io/angular/2016/10/13/two-way-data-binding-in-angular-2.html
* To generate app icon : http://blog.ionic.io/automating-icons-and-splash-screens/ (sauf que là la commande c'est ionic cordova resources)
* To do conditional formatting in Angular 2 : https://juristr.com/blog/2016/01/learning-ng2-dynamic-styles/
* To add fontawesome : https://luiscabrera.site/tech/2017/01/09/fontawesome-in-ionic2.html (not straightforward !)
* To add charts with chart.js : https://www.joshmorony.com/adding-responsive-charts-graphs-to-ionic-2-applications/
* Adding custom font : https://stackoverflow.com/questions/36870847/custom-font-with-ionic2
* Adding Google Sign-In : https://angularfirebase.com/lessons/ionic-google-login-with-firebase-and-angularfire/
* Adding Google Drive API : https://medium.com/google-cloud/using-google-apis-with-firebase-auth-and-firebase-ui-on-the-web-46e6189cf571
* Create parallax fixed div effect : https://stackoverflow.com/questions/36511491/make-content-slide-over-h1-parallax-z-index-wont-apply
* testing : https://github.com/ionic-team/ionic-unit-testing-example and https://leifwells.github.io/2017/08/27/testing-in-ionic-configure-existing-projects-for-testing/
