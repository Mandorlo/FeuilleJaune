import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import _ from 'lodash';

@Injectable()
export class FjService {
  private db_fj = "dbfj";

  constructor(private storage: Storage) {

  }

  getAllFJ() { // renvoie tous les json + metadata de feuilles faunes
    return this.storage.get(this.db_fj);
  }

  saveFJ(fjdata, opt) {
    let fjdata_plus = {
      personne: opt.personne,
      maison: opt.maison,
      month: opt.curr_month,
      data: fjdata
    }

    return new Promise((resolve, reject) => {
      this.getAllFJ().then(data => {
        if(!data || !data.length) data = [];
        let already_exists = _.find(data, {'month': fjdata_plus.month});
        if (already_exists) { // TODO gérer de manière plus cool avec un prompt
          console.log("une feuille jaune du mois de " + fjdata_plus.month + " existe déjà : ", already_exists);
          reject("une feuille jaune du mois de " + fjdata_plus.month + " existe déjà")
        } else {
          data.push(fjdata_plus);
        }
        this.storage.set(this.db_fj, data).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  }

}
