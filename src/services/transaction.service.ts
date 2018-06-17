import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { ParamService } from './param.service';
import { CurrencyService } from './currency.service';

import _ from 'lodash';
import moment from 'moment';




@Injectable()
export class TransactionService {
  private key: string = "transactions";
  private cat_lists = { 'in': [], 'out': [] };

  constructor(private storage: Storage,
    private paramService: ParamService,
    private currencyService: CurrencyService) { }

  set(tr_list) {
    return this.storage.set(this.key, tr_list);
  }

  raz() {
    return this.set([])
  }

  async add(tr) {
    let tr_list = await this.getAll()
    tr.id = this.genId(tr)
    tr.icon = this.smartIcon(tr)
    tr_list.push(tr)
    return this.set(tr_list)
  }

  // met à jour la transaction tr
  async update(id, tr) {
    let tr_list = await this.getAll()
    let ind = tr_list.findIndex(el => el.id == id)
    if (ind) {
      tr_list.splice(ind, 1, tr)
    } else {
      console.log("Aucune mise à jour de la trasanction pour id=" + id + " et tr:", tr)
      return 0
    }
    return this.set(tr_list)
  }

  trEqual(tr, el) {
    if ('id' in tr && 'id' in el) return tr['id'] == el['id'];
    else return el.montant == tr.montant && el.name == tr.name && el.date == tr.date
  }

  genId(tr) {
    let alea = "_" + Math.round(Math.random()*1000000).toString();
    return moment(tr.date).format("YYMMDD") + "_" + tr.name + alea;
  }

  async delete(tr) {
    let tr_list = await this.getAll()
    if (typeof tr != 'object') tr = tr_list.find(el => el.id == tr.id)
    if (!tr) throw {
      errnum: "INVALID_PARAM",
      fun: 'transaction.service > delete',
      arg: tr,
      descr: "Cannot delete this element, wrong format or unknown id"
    }
    if (typeof tr_list != 'object' || !tr_list.length) throw "le format de la base de données des transactions est corrompu, ou la base est vide"

    let ind = tr_list.findIndex(el => el.id == tr.id)
    if (ind) {
      tr_list.splice(ind, 1)
      return this.set(tr_list)
    } else {
      console.log("WARNING in transaction.service > delete : transaction not found...", tr)
      return 0
    }    
  }

  async getAll() {
    let tr_list = await this.storage.get(this.key) // this is a promise
    if (!tr_list) return []
    tr_list = this.fixOldTrFormat(tr_list)
    return tr_list
  }

  async getTransactions(month = null, currency = null) {
    let tr_list = await this.getAll()
    if (month) {
      month = this.paramService.toMoment(month)
      let mymonth = month.month()
      let myyear = month.year()
      tr_list = tr_list.filter(tr => moment(tr.date, 'YYYY-MM-DD').month() == mymonth && moment(tr.date, 'YYYY-MM-DD').year() == myyear)
    }
    if (currency) { // 'EUR', 'ILS', ...
      tr_list = tr_list.filter(tr => tr.currency == currency)
    }
    return tr_list
  }

  // renvoie la liste des devises du mois, basée sur les transactions (pas sur les fj)
  // e.g. ['EUR', 'ILS']
  async getMonthCurrencies(month) {
    month = this.paramService.toMoment(month)
    let tr_list = await this.getTransactions(month);
    return _.uniq(tr_list.map(tr => tr.currency))
  }

  // renvoie le total des dépenses du mois en convertissant dans la devise @devise
  async getTotalDepensesMonth(month, devise = null, tr_list = null) {
    if (!devise) devise = this.paramService.currency
    month = this.paramService.toMoment(month)
    let mymonth = month.month()
    let myyear = month.year()
    if (!tr_list) tr_list = await this.getAll()
    let month_tr_list = tr_list.filter(tr => moment(tr.date, 'YYYY-MM-DD').month() == mymonth && moment(tr.date, 'YYYY-MM-DD').year() == myyear)
    return _.sum(month_tr_list.map(tr => this.currencyService.convert(tr.montant, tr.currency, devise)))
  }

  // renvoie la liste des transactions du mois @month
  // si currency != null, renvoie uniquement les transactions en devise @currency
  async getTrMonthCurrency(month, currency = null, tr_list = null) {
    console.log('getting transactions with these parameters : ', month, currency)
    month = this.paramService.toMoment(month)
    if (!tr_list || !tr_list.length) tr_list = await this.getAll()
    let tr_list_filtered = tr_list.filter(tr => moment(tr.date, 'YYYY-MM-DD').month() == month.month() && moment(tr.date, 'YYYY-MM-DD').year() == month.year())
    if (currency) tr_list_filtered = tr_list_filtered.filter(tr => tr.currency == currency)
    return tr_list_filtered
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
      let smart_icon = this.paramService.guessIcon(curr_tr.name);
      if (smart_icon.length) myicon = smart_icon;
    }

    if (curr_tr.type == 'depot') {
      myicon = "fa-angle-double-left";
    } else if (curr_tr.type == 'retrait') {
      myicon = "fa-angle-double-right";
    }

    return myicon
  }

  // ========================================================
  //             HELPER FUNS TO FIX OLD TR FORMATS
  // ========================================================

  fixOldTrFormat(tr_list) {
    for (let i = 0; i < tr_list.length; i++) {
      if (!('id' in tr_list[i])) tr_list[i].id = this.genId(tr_list[i]);
    }
    return tr_list
  }

}
