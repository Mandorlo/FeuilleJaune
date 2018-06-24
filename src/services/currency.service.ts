import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ParamService } from './param.service';
//import client from 'node-rest-client-promise';
//import { currency_api_key } from '../arcana/apis_config';

import { _ } from './_.service';

export type currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'PLN' | 'HUF' | 'CZK' | 'ILS' | 'LBP' | 'BRL' | 'MUR' | 'MGA' | 'BIF' | 'CAD' | 'CDF' | 'XOF' | 'PHP';

@Injectable()
export class CurrencyService {
  //public APIKEY: string = currency_api_key
  //public url = `https://data.fixer.io/api/latest?access_key=${this.APIKEY}&base=EUR&symbols=@sym`
  //public currencies_id_backuponly : ['EUR', 'USD', 'GBP', 'CHF', 'PLN', 'HUF', 'CZK', 'ILS', 'LBP', 'BRL', 'MUR', 'MGA', 'BIF', 'CAD', 'CDF', 'XOF', 'PHP']
  public conversions;

  constructor(private paramService: ParamService, private storage: Storage) {

    this.init().catch(e => {
      console.log('ERROR in currency.service : ', e)
    })
  }

  public async init() {
    if (this.isInit()) return 1;
    let res = await this.paramService.ready()
    if (res) {
      console.log("ok got res true from paramService.ready() : ", res, this.paramService.currencies)
      this.conversions = _.mapObj(this.paramService.currencies, 'id', 'default_rate_eur')
      this.storage.set('currency_conversion', this.conversions)
    } else {
      this.conversions = await this.getLocalConversions()
    }
    /* let http_result = null;
    let url = this.url

    try {
      let res = await this.paramService.ready()
      let currencies_id;
      if (res) {
        console.log("ok got res true from paramService.ready() : ", res, this.paramService.currencies)
        currencies_id = this.paramService.currencies.map(c => c.id)
      } else {
        console.log("got res false from paramService.ready(), getting backup currencies : ", this.currencies_id_backuponly)
        currencies_id = this.currencies_id_backuponly
      }
      let symbols = currencies_id.join(',')
      url = this.url.replace('@sym', symbols)
      http_result = await client.Client({}).getPromise(url)
    } catch(err) {
      console.log('WARNING : Failed to contact currency API, getting local currency conversion rates', url, err)
      this.conversions = await this.getLocalConversions()
      return 2
    }

    if (http_result && http_result.data.success) {
      this.conversions = http_result.data.rates
      this.storage.set('currency_conversion', this.conversions)
      return 1
    } else {
      console.log('WARNING : failed to contact currency API, getting local currency conversion rates', url, http_result)
      this.conversions = await this.getLocalConversions()
      return 3
    } */
  }

  isInit() {
    return (this.conversions && this.conversions['EUR'] && this.conversions['ILS'])
  }

  // récupère des taux de change locaux si l'API est injoignable
  async getLocalConversions() {
    this.conversions = await this.storage.get('currency_conversion')
    if (this.conversions === null) {
      this.conversions = {}
      for (let c of this.paramService.currencies) {
        this.conversions[c.id] = c.default_rate_eur
      }
    }
    console.log("local currency rates : ", this.conversions)
    return this.conversions
  }

  // e.g. : convert(123.45, 'USD', 'EUR') => convertit 123.45 USD en EUR
  public convert(montant, from, to = null) {
    if (typeof montant == 'string') montant = parseFloat(montant)
    if (montant === 0) return montant;
    if (to === null) to = this.paramService.currency;
    if (from == to) return montant;
    if (!this.conversions) throw {
      'errnum': 'NOT_INITIALIZED',
      'fun': 'CurrencyService.convert',
      'descr': 'The conversion has not been initialized (works with a REST API)'
    }
    if (!to || !from) {
      console.log(`WARNING : impossible de convertir ${montant} de ${from} à ${to}. On renvoie le montant tel quel`)
      return montant;
    }

    if (!montant || !this.conversions[to] || !this.conversions[from]) {
      console.log('CONVERSION:',this.conversions)
      throw {
        'errnum': ['INVALID_PARAM', 'INVALID_INTERNAL_VAR'],
        'fun': 'CurrencyService.convert',
        'descr': 'One of these is invalid : this.conversions='
          + JSON.stringify(this.conversions)
          + ' OR montant=' + JSON.stringify(montant)
          + ' OR from=' + JSON.stringify(from)
          + ' OR to=' + JSON.stringify(to)
      }
    }

    let base_montant = montant / this.conversions[from]
    return Math.round(base_montant * this.conversions[to] * 100) / 100
  }

  // e.g. : pretty(3.49999997, 'EUR') = "3.5 €"
  pretty (montant, devise = null) {
    // si montant est en fait un objet, on agit différement
    if (typeof montant == 'object') return this.prettyObj(montant);

    if (!devise || devise == 'all') devise = this.paramService.currency;
    let symbol = this.paramService.symbolCurrency(devise)
    if (typeof montant != 'number') montant = parseFloat(montant);
    return montant.toFixed(2) + ' ' + symbol;
  }

  // traverse tous l'objet obj et transforme tous les champs "banque", "caisse" et "bc" en pretty string (e.g. 3.49999997 devient "3.5 €")
  prettyObj(obj) {
    return _.traverse(obj,  (attr, val, tree) => attr == 'banque' || attr == 'caisse' || attr == 'bc', 
                            (attr, val, tree) => this.pretty(val, tree.parent.val))
  }
}
