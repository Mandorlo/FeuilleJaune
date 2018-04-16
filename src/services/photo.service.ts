import { Injectable } from '@angular/core';
import request from 'request';
import { ParamService } from './param.service';


@Injectable()
export class PhotoService {
  private subscriptionKey = '2b60f1faee594490b70e478468625756';
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
      url: 'https://api.cognitive.microsoft.com/bing/v7.0/images/search?q=' + encodeURIComponent(s),
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
            if (!o.value || !o.value.length) reject('invalid body in randPhoto result for ' + s);
            else {
              console.log('photo search ' + s + ' got ' + o.value.length + ' results')
              let l = (this.severe) ? 2: o.value.length;
              let rand_int: number = Math.round(Math.random() * l);
              let rand_photo = o.value[rand_int];
              let myPhoto = {
                url: rand_photo.thumbnailUrl,
                width: rand_photo.thumbnail.width,
                height: rand_photo.thumbnail.height
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
