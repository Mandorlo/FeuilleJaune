import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { ParamService } from './param.service';

import _ from 'lodash';




@Injectable()
export class TransactionService {
  private key: string = "transactions";
  private cat_lists = { 'in': [], 'out': [] };

  constructor(private storage: Storage,
    private paramService: ParamService) { }

  set(tr_list) {
    return this.storage.set(this.key, tr_list);
  }

  add(tr) {
    // TODO ?
  }

  trEqual(tr, el) {
    return el.montant == tr.montant && el.name == tr.name && el.date == tr.date
  }

  // update(tr) { // TODO à compléter, ne pas utiliser ! Car il faut ajouter un id pour chaque tr !!!!
  //   return new Promise((resolve, reject) => {
  //     this.getAll().then(data => {
  //       if (typeof data != 'object' || !data.length) reject("le format de la base de données des transactions est corrompu, ou la base est vide");
  //       let newdata = [];
  //       data.forEach(el => {
  //         // if (this.trEqual(tr, el))
  //       })
  //     }).catch(err => {
  //       reject(err)
  //     })
  //   });
  // }

  delete(tr) {
    if (typeof tr == 'object') {
      return new Promise((resolve, reject) => {
        this.getAll().then(data => {
          if (typeof data != 'object' || !data.length) reject("le format de la base de données des transactions est corrompu, ou la base est vide");
          let newdata = [];
          let supprime: boolean = false;
          data.forEach(el => {
            if (this.trEqual(tr,el)) {
              supprime = true;
            } else {
              newdata.push(el)
            }
          });
          if (newdata.length == data.length) {
            reject("L'élément n'a pas été trouvé, rien n'a été supprimé")
          } else {
            this.set(newdata).then(_ => {
              resolve("Element supprimé")
            }).catch(err => {
              reject(err)
            })
          }
        }).catch(err => {
          reject(err)
        })
      })
    } else {
      console.log("problem, tr is not an object")
    }
  }

  getAll() {
    return this.storage.get(this.key)
  }


  /* ===================== Cosmetic services =========================== */

  categoryLabel(curr_tr) {
    if (!this.cat_lists.in || this.cat_lists.in.length <= 0) {
      this.cat_lists.out = this.paramService.categories;
      this.cat_lists.in = this.paramService.categories_in;
    }
    let cat_list = (curr_tr.type == "out") ? this.cat_lists.out : this.cat_lists.in;
    let el = _.find(cat_list, { 'id': curr_tr.category });
    if (el) {
      if (curr_tr.type == 'depot') {
        return "Dépôt à la banque"
      } else if (curr_tr.type == 'retrait') {
        return "Retrait d'argent liquide"
      } else {
        return el.label;
      }
    } else {
      console.log("Cannot find category label for ", curr_tr)
    }
  }

  smartIcon(curr_tr) {
    if (!this.cat_lists.in || this.cat_lists.in.length <= 0) {
      this.cat_lists.out = this.paramService.categories;
      this.cat_lists.in = this.paramService.categories_in;
    }
    let cat_list = (curr_tr.type == "out") ? this.cat_lists.out : this.cat_lists.in;
    let myicon = "";
    let el = _.find(cat_list, { 'id': curr_tr.category });
    if (el) {
      myicon = el.icon;
      let smart_icon = this.smartIconCore(curr_tr);
      if (smart_icon.length) myicon = smart_icon;
    }

    if (curr_tr.type == 'depot') {
      myicon = "fa-angle-double-left";
    } else if (curr_tr.type == 'retrait') {
      myicon = "fa-angle-double-right";
    }

    return myicon
  }

  smartIconCore(tr) {
    let nom = tr.name.toLowerCase();
    if (nom.indexOf("vol ") > -1 || nom.indexOf("avion") > -1 || nom.indexOf("flight") > -1 || nom.indexOf("plane") > -1) {
      return "fa-plane"
    } else if (nom.indexOf("photo") > -1) {
      return "fa-camera"
    } else if (nom.indexOf("hairdresser") > -1 || nom.indexOf("coiffeur") > -1) {
      return "fa-scissors"
    } else if (nom.indexOf("taxi") > -1 || nom.indexOf("cab") > -1) {
      return "fa-cab"
    } else if (nom.indexOf("metro") > -1 || nom.indexOf("subway") > -1) {
      return "fa-subway"
    } else if (nom.indexOf("beer") > -1 || nom.indexOf("bière") > -1 || nom.indexOf("biere") > -1 || nom.indexOf("verre") > -1) {
      return "fa-beer"
    } else if (nom.indexOf("hotel") > -1 || nom.indexOf("bnb") > -1) {
      return "fa-bed"
    } else if (nom.indexOf("boat") > -1 || nom.indexOf("bateau") > -1 || nom.indexOf("voile") > -1) {
      return "fa-anchor"
    } else if (nom.indexOf("book") > -1 || nom.indexOf("livre") > -1) {
      return "fa-book"
    } else {
      return ""
    }
  }
}
