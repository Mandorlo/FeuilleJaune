import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { ParamService } from './param.service';

import _ from 'lodash';
import moment from 'moment';




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
    return new Promise((resolve, reject) => {
      this.getAll().then(data => {
        tr.id = this.genId(tr);
        tr.icon = this.smartIcon(tr);
        data.push(tr);
        this.set(data).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  }

  update(id, tr) {
    return new Promise((resolve, reject) => {
      this.getAll().then(data => {
        let newdata = [];
        let updated = false;
        data.forEach((el, i) => {
          if ('id' in el && el["id"] == id) {
            newdata.push(tr)
            updated = true;
          } else {
            if (!('id' in el)) el.id = this.genId(el);
            newdata.push(el)
          }
        });
        if (!updated) console.log("Aucune mise à jour de la trasanction pour id=" + id + " et tr:", tr)
        this.set(newdata).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  }

  trEqual(tr, el) {
    if ('id' in tr && 'id' in el) return tr['id'] == el['id'];
    else return el.montant == tr.montant && el.name == tr.name && el.date == tr.date
  }

  genId(tr) {
    let alea = "_" + Math.round(Math.random()*1000000).toString();
    return moment(tr.date).format("YYMMDD") + "_" + tr.name + alea;
  }

  delete(tr) {
    if (typeof tr == 'object') {
      return new Promise((resolve, reject) => {
        this.getAll().then(data => {
          if (typeof data != 'object' || !data.length) reject("le format de la base de données des transactions est corrompu, ou la base est vide");
          let newdata = [];
          let supprime: boolean = false;
          data.forEach(el => {
            if (!('id' in el)) el['id'] = this.genId(el);
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
    } else if (nom.indexOf("train") > -1) {
      return "fa-train"
    } else if (nom.indexOf("bus") > -1) {
      return "fa-bus"
    } else if (nom.indexOf("photo") > -1) {
      return "fa-camera"
    } else if (nom.indexOf("hairdresser") > -1 || nom.indexOf("coiffeur") > -1) {
      return "fa-scissors"
    } else if (nom.indexOf("taxi") > -1 || nom.indexOf("cab") > -1 || nom.indexOf("uber") > -1 || nom.indexOf("blablacar") > -1) {
      return "fa-cab"
    } else if (nom.indexOf("metro") > -1 || nom.indexOf("subway") > -1) {
      return "fa-subway"
    } else if (nom.indexOf("beer") > -1 || nom.match(/bi[èe]re/) || nom.indexOf("verre") > -1) {
      return "fa-beer"
    } else if (nom.indexOf("hotel") > -1 || nom.indexOf("bnb") > -1) {
      return "fa-bed"
    } else if (nom.indexOf("boat") > -1 || nom.indexOf("bateau") > -1 || nom.indexOf("voile") > -1) {
      return "fa-anchor"
    } else if (nom.indexOf("book") > -1 || nom.indexOf("livre") > -1) {
      return "fa-book"
    } else if (nom.indexOf("pizza") > -1) {
      return "myicon-pizza"
    } else if (nom.indexOf("bible") > -1) {
      return "myicon-bible"
    } else if (nom.match(/(^| )(biscuit|biscott)/g)) {
      return "myicon-biscuit"
    } else if (nom.match(/(^| )(eau|water|acqua)/g) || nom.match(/(^| )(coca|milk|lait|latte)/g)) {
      return "myicon-bottle"
    } else if (nom.match(/(^| )(brioche|dolc[ei]|gateau|cake|muffin)/g)) {
      return "myicon-muffin"
    } else if (nom.match(/(^| )(croissant|viennoiserie|pain|bread|baguette|pane)/g)) {
      return "myicon-croissant"
    } else if (nom.match(/(^| )(coffee|caf[ée]|caff[eèé]|th?[éèe]($| ))/g)) {
      return "myicon-coffee"
    } else if (nom.match(/(^| )(choco|ciocco)/g)) {
      return "myicon-chocolate"
    } else if (nom.match(/(^| )(panin[oi]|hamburger|sandwich)/g)) {
      return "myicon-hamburger"
    } else if (nom.match(/(^| )(dentifric|brosse [àa] dent|spazzolin|toothpaste|toothbrush)/g)) {
      return "myicon-toothpaste"
    } else if (nom.match(/(^| )(slip|cale[çc]on|culotte)/g)) {
      return "myicon-underpants"
    } else if (nom.match(/(^| )(medicament|medicine)/g)) {
      return "myicon-medicament"
    } else if (nom.match(/(^| )(pansement|bandage|garza|cerott)/g)) {
      return "myicon-bandage"
    } else if (nom.match(/(^| )(deo($| |dorant)|ddt)/g)) {
      return "myicon-deodorant"
    } else if (nom.match(/(^| )(shirt|chemise|camici[ae])/g)) {
      return "myicon-shirt"
    } else if (nom.match(/(^| )(pantalon|trouser)/g)) {
      return "myicon-trousers"
    } else if (nom.match(/(^| )(chaussette|calzett|calzin)/g)) {
      return "myicon-socks"
    } else if (nom.match(/(^| )(chaussure|shoe|scarp)/g)) {
      return "myicon-shoe"
    } else if (nom.match(/(^| )(montre|orologio|watch($| ))/g)) {
      return "myicon-watch"
    } else {
      return ""
    }
  }
}
