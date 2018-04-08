import { Injectable } from '@angular/core';
// import { Storage } from '@ionic/storage';
import { ParamService } from './param.service';
import client from 'node-rest-client-promise';

@Injectable()
export class CurrencyService {
  public APIKEY: string = '2659119d03e208f036e49bd71fd1c6ef'
  public url = `http://data.fixer.io/api/latest?access_key=${this.APIKEY}&base=EUR&symbols=@sym`
  public conversions;

  constructor(private paramService: ParamService) {
    let symbols = paramService.currencies.map(c => c.id).join(',')
    this.url = this.url.replace('@sym', symbols)

    this.init()
  }

  public init() {
    if (this.conversions) return Promise.resolve(1);
    return new Promise((resolve, reject) => {
      client.Client({}).getPromise(this.url).catch(e => {
        reject({
          'errnum': 'HTTP_REQUEST_FAILED',
          'fun': 'CurrencyService constructor',
          'descr': `GET ${this.url} request failed : ${JSON.stringify(e)}`
        })
      }).then(r => {
        if (r.data.success) {
          this.conversions = r.data.rates
          resolve(1)
        } else {
          reject({
            'errnum': 'HTTP_RESULT_FAILED',
            'fun': 'CurrencyService constructor',
            'descr': `GET ${this.url} returned success=false because : ${JSON.stringify(r)}`
          })
        }
      })
    })
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
    return (base_montant * this.conversions[to])
  }
}
