import { Injectable } from '@angular/core';
import request from 'request';
import { ParamService } from './param.service';
import { googlesearch_api_key } from '../arcana/apis_config';


@Injectable()
export class PhotoService {
  private subscriptionKey = googlesearch_api_key;
  private paramService;
  private cache = [];
  private cache_keys = [];
  private severe:boolean = false;

  private samples = [
    {
      regex: /(tram|tramway)/gi,
      urls: ['https://upload.wikimedia.org/wikipedia/commons/6/6e/Wuhan_Optics_Valley_Modern_Tram_%284%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/a/a0/Carris_Tram_route_15_Lisbon_12_2016_9828.jpg']
    }, {
      regex: /(cathedral|cattedral|basili[qc]|[ée]glise|chies[ae]|messa( |$)|messe( |$))/gi,
      urls: ['https://upload.wikimedia.org/wikipedia/commons/8/88/St_Albans%2C_Cathedral_and_Abbey_Church_of_St_Alban_-_geograph.org.uk_-_1350217.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/e/eb/Basilica-di-San-Marco-Venice-20050524-029.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/0/02/Bourges-Cath%C3%A9drale_Saint-%C3%89tienne-5.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/5/58/Notre_Dame_I_%28REIMS-CATHEDRAL%29_%28904620963%29.jpg']
    }, {
      regex: /(^| )rer( |$)/gi,
      urls: ['https://upload.wikimedia.org/wikipedia/commons/3/39/RER_E_train_in_Magenta_station.JPG']
    }, {
      regex: /(^| )(trains?|treno|ter)( |$)/gi,
      urls: ['http://s0.geograph.org.uk/geophotos/03/05/04/3050435_09029b6c.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/0/00/Hogwarts_Express_at_Harry_Potter_Experience_at_Leavesden.jpg']
    }, {
      regex: /(^| )(metro|subway)( |$)/gi,
      urls: ['https://upload.wikimedia.org/wikipedia/commons/d/df/Moscow_metro_D_2037_museum_car_panoramic.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/0/04/Subway_station_in_Moscow_2015.JPG']
    }, {
      regex: /(^| )(dentifric|toothpast)/gi,
      urls: ['https://www.protegez-vous.ca/var/protegez_vous/storage/images/_aliases/social_network_image/mediatheque/illustrations-et-images/dentifrice/990970-1-fre-CA/dentifrice.jpg',
            'http://dentalhealthgroup.ca/2014/wp-content/uploads/2015/06/dpc-toothpaste-1030x684.jpg']
    }
  ]

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
            let mot_cle = res[2].trim()
            let url = this.findSample(mot_cle)
            console.log('safesearch mot-cle = ', mot_cle, url)
            if (url) return url
            return mot_cle
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

  findSample(mot_cle) {
    for (let el of this.samples) {
      let res = mot_cle.match(el.regex)
      if (res) {
        let ind = Math.round(Math.random() * (el.urls.length - 1))
        return el.urls[ind]
      }
    }
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
