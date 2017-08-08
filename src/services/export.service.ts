import { Injectable } from '@angular/core';
import { ToastController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { SocialSharing } from '@ionic-native/social-sharing';
import { FileChooser } from '@ionic-native/file-chooser';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Diagnostic } from '@ionic-native/diagnostic';

import { ParamService } from './param.service';
import { TransactionService } from './transaction.service';
import { FjService } from './fj.service';

import _ from 'lodash';
import moment from 'moment';

@Injectable()
export class ExportService {
  private dbfilename: string = "feuillejaune_db.json";

  constructor(public toastCtrl: ToastController,
    public plt: Platform,
    private storage: Storage,
    private paramService: ParamService,
    private trService: TransactionService,
    private fjService: FjService,
    private file: File,
    private socialSharing: SocialSharing,
    private fileChooser: FileChooser,
    private androidPermissions: AndroidPermissions,
    private diagnostic: Diagnostic) {

  }

  showToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  exportDB() { // exports all the dbs (param, transaction, fj) in json format
    this.db2json().then(db => {
      let data = JSON.stringify(db, null, '\t');
      this.coolWrite(this.file.dataDirectory, this.dbfilename, data).then(_ => {
        this.socialSharing.share("", "Export db Feuille Jaune", this.file.dataDirectory + "/" + this.dbfilename).then(e => {
          this.showToast("Base de données exportée ! Merci Seigneur de prendre soin de nous !");
        }).catch(err => {
          if (err === false) {
            this.showToast("Base de données exportée ! Merci Seigneur de prendre soin de nous !");
          } else {
            console.log("Sharing failed: ", err)
          }
        })
      }).catch(err => {
        console.log("Error writing db.json: ", err);
        console.log("Trying to download JSON directly...");
        // let myurl = URL.createObjectURL(data);
        this.downloadBrowser(data);
      })
    }).catch(err => {
      console.log("Export failed: ", err);
    });
  }

  importDB() {
    if (this.plt.is('android')) {
      this.fileChooser.open()
        .then(uri => {
          let name = uri.split('/').reverse()[0];
          let path = uri.substring(0, uri.length - name.length);
          console.log("uri fichier: ", uri, name, path);
          this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
            success => {
              console.log('Permission granted');
              // this.diagnostic.requestExternalStorageAuthorization().then(success => {
                this.readDB(path, name);
              // }).catch(err => {
              //   console.log("unable to get runtime permission external storage", err)
              // });
            }, err => {
              this.androidPermissions.requestPermissions(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
                .then(_ => {
                  console.log("ok permission");
                  this.readDB(path, name);
                }).catch(err => {
                  console.log("cannot give permission to read sd card", err)
                })
            });
        })
        .catch(e => console.log(e));
    } else if (this.plt.is('windows') || this.plt.is('core')) {
      console.log("It's a browser, not supported directly by export service, only by the calling component")
    } else {
      alert("Platform " + JSON.stringify(this.plt.platforms) + " not recognized :(")
    }
  }

  readDB(path, name) {
    this.file.readAsText(path, name).then(data => {
      this.importDBcore(JSON.parse(data))
    }).catch(err => {
      console.log("erreur en lisant le fichier: ", err)
    })
  }

  importDBcore(db) {
    if (!this.isValidDB(db)) return;
    this.paramService.setMaison(db.param.maison);
    this.paramService.setPersonne(db.param.personne);
    this.paramService.setCurrency(db.param.currency);
    this.trService.set(db.transaction);
    this.fjService.setAllFJ(db.fj);
    this.showToast('Base de données chargée, béni soit le nom du Seigneur !')
  }

  isValidDB(o) {
    let res = true;
    res = res && o.param && o.transaction && o.fj;
    res = res && o.param.maison && o.param.personne;
    // TODO
    return res;
  }

  db2json() {
    let db = { 'param': {}, 'transaction': [], 'fj': [] };
    db.param = {
      'personne': this.paramService.personne,
      'maison': this.paramService.maison,
      'currency': this.paramService.currency
    }

    return new Promise((resolve, reject) => {
      this.trService.getAll().then(data => {
        if (typeof data == 'object' && data.length) {
          db.transaction = _.orderBy(data, ['date'], ['desc']);
        } else {
          console.log("Le format de la base de transactions n'est pas bon ou la base est vide, on utilise du coup une base vide");
          db.transaction = [];
        }

        this.fjService.getAllFJ().then(data => {
          db.fj = data;
          if (!data || !data.length) db.fj = [];
          db.fj = _.sortBy(db.fj, [(o) => { return o.month }])
          resolve(db);
        }).catch(err => {
          reject(err)
        })

      }).catch(err => {
        reject(err)
      })
    });
  }

  downloadBrowser(text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', this.dbfilename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  downloadBrowser2(data) {

    var element = document.createElement('a');
    // element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('href', data);
    element.setAttribute('download', this.dbfilename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  coolWrite(path, filename, blob) {
    return new Promise((resolve, reject) => {
      this.file.checkFile(path, filename).then(exists => {
        if (exists) {
          this.file.removeFile(path, filename).then(res => {
            this.file.writeFile(path, filename, blob, true).then(res => {
              resolve(res)
            }).catch(err => {
              reject(err)
            });
          }).catch(err => {
            console.log("Error removing existing file at " + path + "/" + filename);
            reject(err)
          })
        } else {
          this.file.writeFile(path, filename, blob, true).then(res => {
            resolve(res)
          }).catch(err => {
            reject(err)
          });
        }
      }).catch(err => {
        console.log("Impossible de vérifier l'existence du fichier " + path + "/" + filename)
        reject(err)
      });
    });
  }

}
