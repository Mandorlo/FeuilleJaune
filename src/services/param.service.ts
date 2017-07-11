import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb';
import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import cordovaWebsqlPlugin from 'pouchdb-adapter-websql';

@Injectable()
export class ParamService {
  private _db;
  public personne:string;
  public maison:string;

  initDB() {
    let myAdapter = "cordova-sqlite";
    if (window && (<any>window).cordova) {
      PouchDB.plugin(cordovaSqlitePlugin);
      // console.log("Loaded PouchDB SQLite adapter for Mobile Cordova")
    }
    else {
      PouchDB.plugin(cordovaWebsqlPlugin);
      myAdapter = "websql";
      // console.log("Loaded PouchDB WebSQL adapter for browser");
    }
    this._db = new PouchDB('param.db', { adapter: myAdapter });

    this._db.get("personne").then(doc => this.personne = doc.data).catch(err => console.log(err));
    this._db.get("maison").then(doc => this.maison = doc.data).catch(err => console.log(err));
  }

  setParam(param_name, param_value) {
    if (!this._db) this.initDB();
    this[param_name] = param_value;
    return new Promise((resolve, reject) => {
      this._db.get(param_name).then(doc => {
        doc.data = param_value;
        resolve(this._db.put(doc));
      }).catch(err => {
        resolve(this._db.put({ '_id': param_name, 'data': param_value }));
      });
    });
  }
}
