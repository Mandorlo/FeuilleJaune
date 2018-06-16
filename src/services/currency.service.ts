import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ParamService } from './param.service';
import client from 'node-rest-client-promise';
import { currency_api_key } from '../arcana/apis_config';

@Injectable()
export class CurrencyService {
  public APIKEY: string = currency_api_key
  public url = `http://data.fixer.io/api/latest?access_key=${this.APIKEY}&base=EUR&symbols=@sym`
  public conversions;

  constructor(private paramService: ParamService, private storage: Storage) {
    let symbols = paramService.currencies.map(c => c.id).join(',')
    this.url = this.url.replace('@sym', symbols)

    this.init().catch(e => {
      console.log('ERROR in currency.service : ', e)
    })
  }

  public async init() {
    if (this.conversions) return 1;
    let http_result = null;
    try {
      http_result = await client.Client({}).getPromise(this.url)
    } catch(err) {
      console.log('WARNING : Failed to contact currency API, getting local currency conversion rates', this.url)
      this.conversions = await this.getLocalConversions()
      return 2
    }

    if (http_result && http_result.data.success) {
      this.conversions = http_result.data.rates
      this.storage.set('currency_conversion', this.conversions)
      return 1
    } else {
      console.log('WARNING : failed to contact currency API, getting local currency conversion rates', this.url)
      this.conversions = await this.getLocalConversions()
      return 3
    }
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
}
