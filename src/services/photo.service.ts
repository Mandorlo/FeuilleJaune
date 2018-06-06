import { Injectable } from '@angular/core';
import request from 'request';
import { ParamService } from './param.service';


@Injectable()
export class PhotoService {
  private subscriptionKey = 'AIzaSyDgR7geKq0faSort2zVVFyxgHTIPsIZL34';
  private pexel_apikey = '563492ad6f9170000100000134220e6df7ba49b2ba8a9ae937eac8e8';
  private paramService;
  private cache = [];
  private cache_keys = [];
  private severe:boolean = false;

  constructor(paramService: ParamService) {
    this.paramService = paramService
  }

  public randPhoto(s, protege = true) {
    if (protege) {
      s = this.safeSearch(s)
    }
    if (!s) return Promise.resolve({ url: '' });
    let c = this.getCache(s)
    if (c !== null) {
      console.log('returning cached photo : ', c)
      return Promise.resolve(c);
    }
    if (s.substr(0, 4) == 'http') return Promise.resolve({url: s})

    let options = {
      url: `https://www.googleapis.com/customsearch/v1?searchType=image&q=${encodeURIComponent(s)}&cx=004323286901162026581:48ky0dcc9as&key=${this.subscriptionKey}`,
      headers: {
        'Ocp-Apim-Subscription-Key': this.subscriptionKey
      }
    }

    return new Promise((resolve, reject) => {
      request.get(options, (error, response, body) => {
        if (error) reject(error);
        else {
          try {
            let o = JSON.parse(body)
            console.log('photo search got : ', o)
            if (!o.items || !o.items.length) reject('invalid body in randPhoto result for ' + s);
            else {
              console.log('photo search ' + s + ' got ' + o.items.length + ' results')
              let l = (this.severe) ? 4: o.items.length;
              let rand_int: number = Math.round(Math.random() * l);
              let rand_photo = o.items[rand_int];
              let myPhoto = {
                url: rand_photo.link,
                width: rand_photo.image.width,
                height: rand_photo.image.height
              }
              this.setCache(s, myPhoto);
              resolve(myPhoto)
            }
          } catch (e) {
            reject(e)
          }
        }
      })
    })
  }

  safeSearch(s) {
    for (let el of this.paramService.smart_categories) {
      if (el.photo) {
        let res = el.regex.exec(s)
        if (res && res.length) {
          this.severe = false
          if (el.photo == '$' && res.length > 2) {
            this.severe = true;
            return res[2];
          } else if (el.photo == '*') {
            return s
          } else if (el.photo.substr(0,8) == '@google:') {
            let nom = /\@google\:(.+)/.exec(el.photo)
            console.log('GOOGLE', nom, s, el.photo)
            if (nom && nom.length > 1) return `https://ssl.gstatic.com/calendar/images/eventillustrations/v1/img_${nom[1]}_1x.jpg`
          } else if (el.photo != '$') {
            return el.photo
          }
        }
      }
    }
    return ''
  }

  setCache(key, val) {
    let n = this.cache_keys.indexOf(key)
    if (n >= 0) this.cache[n] = val;
    else {
      this.cache_keys.push(key)
      this.cache.push(val)
    }
  }

  getCache(key) {
    let n = this.cache_keys.indexOf(key)
    if (n >= 0) return this.cache[n];
    return null
  }
}

// randPhoto('hummus').then(r => console.log(r)).catch(e => console.log('ERROR', e))
