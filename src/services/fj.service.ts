import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { PdfService } from './pdf.service';
import { ParamService } from './param.service';

import _ from 'lodash';

@Injectable()
export class FjService {
  private db_fj = "dbfj";

  constructor(private storage: Storage,
    private pdfService: PdfService,
    private paramService: ParamService) {

  }

  setAllFJ(fj_list) {
    // /!\ be careful using this
    this.storage.set(this.db_fj, fj_list);
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
        console.log("going to save fjdata_plus: ",fjdata_plus);
        console.log("already existing FJs: ", data);
        if (!data || !data.length) data = [];
        let already_exists = _.find(data, { 'month': fjdata_plus.month });
        if (already_exists) { // TODO gérer de manière plus cool avec un prompt
          if (!opt.already_exists) {
            console.log("une feuille jaune du mois de " + fjdata_plus.month + " existe déjà : ", already_exists);
            reject("une feuille jaune du mois de " + fjdata_plus.month + " existe déjà")
          } else {
            console.log("une feuille jaune du mois de " + fjdata_plus.month + " existe déjà, on overwrite ");
            data = _.reject(data, {'month': fjdata_plus.month});
            data.push(fjdata_plus);
          }
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

  deleteFJ(fj_list) { // array des objets fj
    let list_months = _.map(fj_list, 'month');

    return new Promise((resolve, reject) => {
      this.getAllFJ().then(data => {
        if (!data || !data.length) resolve("ok");
        else {
          let newdata = _.reject(data, (o) => {
            return (list_months.indexOf(o.month) > -1);
          });
          console.log("new fj_list will be: ", newdata);
          this.storage.set(this.db_fj, newdata).then(res => {
            resolve(res)
          }).catch(err => {
            reject(err)
          })
        }
      }).catch(err => {
        reject(err)
      })
    })
  }

  shareFJ(month) { // month should have format YYYY-MM
    let opt = {
      'personne': this.paramService.personne,
      'maison': this.paramService.maison,
      'curr_month': month,
      'filename': 'feuillejaune.pdf'
    }

    return new Promise((resolve, reject) => {
      this.getAllFJ().then(data => {
        let myfj = _.find(data, { 'month': month });
        if (myfj) {
          this.pdfService.createPdf(myfj.data, opt).then((pdf) => {
            let blob = new Blob([pdf], { type: 'application/pdf' });
            this.pdfService.shareFJ(blob, opt).then(res => {
              resolve(res)
            }).catch(err => {
              reject(err)
            })
          }).catch(err => {
            reject(err)
          })
        } else {
          reject("Pas de feuille jaune pour le mois de " + month + " dans la db :(")
        }
      }).catch(err => {
        console.log("Error retrieving all fj from db : ", err);
        reject(err)
      })
    })
  }

}
