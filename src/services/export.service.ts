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

  async exportDB() {
    let db = await this.db2json()
    let data = JSON.stringify(db, null, '\t');

    if (this.plt.is('android') && !this.plt.is('mobileweb')) {
      return this.exportDB_android(data)
    } else {
      this.downloadBrowser(data);
      return "Browser download started..."
    }
  }

  async exportDB_android(data) {
    await this.coolWrite(this.file.dataDirectory, this.dbfilename, data)
    try {
      await this.socialSharing.share("", "Export db Feuille Jaune", this.file.dataDirectory + "/" + this.dbfilename)
      return "Base de données exportée ! Merci Seigneur de prendre soin de nous !"
    } catch(e) {
      if (e === false) return "Base de données exportée ! Merci Seigneur de prendre soin de nous !"
      else throw e
    }
  }

  exportDB_old() { // exports all the dbs (param, transaction, fj) in json format
    return new Promise((resolve, reject) => {
      this.db2json().then(db => {
        let data = JSON.stringify(db, null, '\t');
        this.coolWrite(this.file.dataDirectory, this.dbfilename, data).then(_ => {
          this.socialSharing.share("", "Export db Feuille Jaune", this.file.dataDirectory + "/" + this.dbfilename).then(e => {
            resolve("Base de données exportée ! Merci Seigneur de prendre soin de nous !");
          }).catch(err => {
            if (err === false) {
              resolve("Base de données exportée ! Merci Seigneur de prendre soin de nous !")
            } else {
              reject(err)
            }
          })
        }).catch(err => {
          console.log("Error writing db.json: ", err);
          console.log("Trying to download JSON directly...");
          // let myurl = URL.createObjectURL(data);
          this.downloadBrowser(data);
          resolve("Browser download started...")
        })
      }).catch(err => {
        reject(err);
      });
    })
  }

  async importDB() {
    if (this.plt.is('android')) {
      return this.importDB_android()
    } else if (this.plt.is('windows') || this.plt.is('core')) {
      console.log("It's a browser, not supported directly by export service, only by the calling component");
      throw "It's a browser, not supported directly by export service, only by the calling component"
    } else {
      alert("Platform " + JSON.stringify(this.plt.platforms) + " not recognized :(")
      throw "Platform " + JSON.stringify(this.plt.platforms) + " not recognized :("
    }
  }

  async importDB_android() {
    let uri = await this.fileChooser.open()
    let name = uri.split('/').reverse()[0];
    let path = uri.substring(0, uri.length - name.length);
    console.log("uri fichier: ", uri, name, path);

    try {
      await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
      console.log('Permission granted');
      return this.readDB(path, name)
    } catch(e) {
      await this.androidPermissions.requestPermissions(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
      console.log("ok permission");
      return this.readDB(path, name)
    }

  }

  importDB_old() {
    // TODO delete this function
    /* if (this.plt.is('android')) {
      return new Promise((resolve, reject) => {
        this.fileChooser.open()
          .then(uri => {
            let name = uri.split('/').reverse()[0];
            let path = uri.substring(0, uri.length - name.length);
            console.log("uri fichier: ", uri, name, path);
            this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
              success => {
                console.log('Permission granted');
                // this.diagnostic.requestExternalStorageAuthorization().then(success => {
                this.readDB(path, name).then(res => resolve(res)).catch(err => reject(err));
                // }).catch(err => {
                //   console.log("unable to get runtime permission external storage", err)
                // });
              }, err => {
                this.androidPermissions.requestPermissions(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
                  .then(_ => {
                    console.log("ok permission");
                    this.readDB(path, name).then(res => resolve(res)).catch(err => reject(err));
                  }).catch(err => {
                    console.log("cannot give permission to read sd card", err)
                    reject(err)
                  })
              });
          })
          .catch(e => reject(e));
      })
    } else if (this.plt.is('windows') || this.plt.is('core')) {
      console.log("It's a browser, not supported directly by export service, only by the calling component");
      return Promise.reject("It's a browser, not supported directly by export service, only by the calling component")
    } else {
      alert("Platform " + JSON.stringify(this.plt.platforms) + " not recognized :(")
      return Promise.reject("Platform " + JSON.stringify(this.plt.platforms) + " not recognized :(")
    } */
  }

  async readDB(path, name) {
    let data = await this.file.readAsText(path, name)
    return this.importDBcore(JSON.parse(data))
  }

  readDB_old(path, name) {
    // TODO delete this function
    /* return new Promise((resolve, reject) => {
      this.file.readAsText(path, name).then(data => {
        this.importDBcore(JSON.parse(data))
        resolve("ok") 
      }).catch(err => {
        console.log("erreur en lisant le fichier: ", err)
        reject(err)
      })
    }) */
  }

  async importDBcore(db) {
    if (!this.isValidDB(db)) return;
    let plist = []
    plist.push(this.paramService.setMaison(db.param.maison))
    plist.push(this.paramService.setPersonne(db.param.personne))
    plist.push(this.paramService.setCurrency(db.param.currency))
    plist.push(this.trService.set(this.fixTransactions(db.transaction)))
    //this.fjService.setAllFJ(this.fixFJ(db.fj)); // TODO delete this line
    plist.push(this.fjService.setAllFJ(db.fj))
    let results = await Promise.all(plist)
    this.showToast('Base de données chargée, béni soit le nom du Seigneur !')
    return 1
  }

  fixTransactions(tr_list) {
    // convertit les transactions de la version <= 0.9.4 vers la version 0.10.0
    // la différence est qu'il y a un champs 'currency' en plus à partir de la version 0.10.0
    // du coup pour convertir on convertit tout en paramService.currency (ou en euros si ce n'ets pas défini)
    let curr:string = (this.paramService.currency) ? this.paramService.currency : 'EUR';
    return tr_list.map(tr => {
      if (!tr.currency) tr.currency = curr;
      return tr
    })
  }

  fixFJ(fj_list) {
    // TODO : delete this function
    // convertit les feuilles jaunes de la version <= 0.9.4 vers la version 0.10.0
    // la différence est qu'il y a un champs 'currency' en plus à partir de la version 0.10.0
    // du coup pour convertir on convertit tout en paramService.currency (ou en euros si ce n'ets pas défini)
    /* let curr:string = (this.paramService.currency) ? this.paramService.currency : 'EUR';
    return fj_list.map(fj => {
      if (!fj.currency) fj.currency = curr;
      return fj
    }) */
  }

  isValidDB(o) {
    let res = true;
    res = res && o.param && o.transaction && o.fj;
    res = res && o.param.maison && o.param.personne;
    // TODO
    return res;
  }

  async db2json() {
    let db = { 'param': {}, 'transaction': [], 'fj': [] };
    db.param = {
      'personne': this.paramService.personne,
      'maison': this.paramService.maison,
      'currency': this.paramService.currency
    }

    // on sauvegarde toutes les transactions
    let tr_list = await this.trService.getAll()
    if (typeof tr_list == 'object' && tr_list.length) {
      db.transaction = _.orderBy(tr_list, ['date'], ['desc']);
    } else {
      console.log("Le format de la base de transactions n'est pas bon ou la base est vide, on utilise du coup une base vide");
      db.transaction = [];
    }

    // on sauvegarde toutes les FJ
    let fj_list = await this.fjService.getAllFJ()
    db.fj = fj_list;
    if (!fj_list || !fj_list.length) db.fj = [];
    db.fj = _.sortBy(db.fj, [(o) => { return o.month }])
    return db
  }

  db2json_old() {
    // TODO delete this function
    /* let db = { 'param': {}, 'transaction': [], 'fj': [] };
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
    }); */
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
    // TODO delete this function
    /* var element = document.createElement('a');
    // element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('href', data);
    element.setAttribute('download', this.dbfilename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element); */
  }

  async coolWrite(path, filename, blob) {
    let exists = false
    try {
      exists = await this.file.checkFile(path, filename)
    } catch(e) {
      console.log("Impossible de vérifier l'existence du fichier " + path + "/" + filename)
      return this.file.writeFile(path, filename, blob, {replace:true})
    }
    
    if (exists) {
      await this.file.removeFile(path, filename)
      return this.file.writeFile(path, filename, blob, {replace:true})
    }
    return this.file.writeFile(path, filename, blob, {replace:true})
  }

  coolWrite_old(path, filename, blob) {
    // TODO delete this function
    /* return new Promise((resolve, reject) => {
      this.file.checkFile(path, filename).then(exists => {
        if (exists) {
          this.file.removeFile(path, filename).then(res => {
            this.file.writeFile(path, filename, blob, {replace:true}).then(res => {
              resolve(res)
            }).catch(err => {
              reject(err)
            });
          }).catch(err => {
            console.log("Error removing existing file at " + path + "/" + filename);
            reject(err)
          })
        } else {
          this.file.writeFile(path, filename, blob, {replace:true}).then(res => {
            resolve(res)
          }).catch(err => {
            reject(err)
          });
        }
      }).catch(err => {
        console.log("Impossible de vérifier l'existence du fichier " + path + "/" + filename)
        this.file.writeFile(path, filename, blob, {replace:true}).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        });
      });
    }); */
  }

}
