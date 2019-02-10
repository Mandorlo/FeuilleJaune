import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { AngularFirestore } from 'angularfire2/firestore';
//import { Observable } from 'rxjs/Observable';

//import _ from 'lodash';
import moment from 'moment';

@Injectable()
export class ParamService {

  private readonly categories = [{ 'id': 'alimentation', 'label': 'Alimentation', 'type': 'maison', 'icon': 'fa-cutlery' },
  { 'id': 'energie', 'label': 'Energie (électricité, gaz, ...)', 'type': 'maison', 'icon': 'fa-bolt' },
  { 'id': 'eau', 'label': 'Eau', 'type': 'maison', 'icon': 'fa-tint' },
  { 'id': 'loyer', 'label': 'Loyers et charges', 'type': 'maison', 'icon': 'fa-home' },
  { 'id': 'impot_maison', 'label': 'Impôts locaux et taxes d\'habitation', 'type': 'maison', 'icon': 'fa-university' },
  { 'id': 'assurance_maison', 'label': 'Assurances maison', 'type': 'maison', 'icon': 'fa-shield' },
  { 'id': 'entretien_maison', 'label': 'Entretien maison', 'type': 'maison', 'icon': 'myicon-broom' },
  { 'id': 'travaux', 'label': 'Equipement et travaux maison', 'type': 'maison', 'icon': 'fa-wrench' },
  { 'id': 'divers_maison', 'label': 'Divers frais maison (à préciser)', 'type': 'maison', 'icon': 'myicon-home-frais' },
  { 'id': 'habillement', 'label': 'Habillement', 'type': 'vie courante', 'icon': 'myicon-tshirt' },
  { 'id': 'formation', 'label': 'Retraites, formation adulte', 'type': 'vie courante', 'icon': 'fa-graduation-cap' },
  { 'id': 'impot_personne', 'label': 'Impôts et taxes des personnes physiques', 'type': 'vie courante', 'icon': 'fa-university' },
  { 'id': 'sante', 'label': 'Dépenses de santé', 'type': 'vie courante', 'icon': 'fa-medkit' },
  { 'id': 'hygiene', 'label': 'Hygiène', 'type': 'vie courante', 'icon': 'myicon-clean' },
  { 'id': 'livre', 'label': 'Livres, journaux', 'type': 'vie courante', 'icon': 'fa-book' },
  { 'id': 'loisir', 'label': 'Loisirs, vacances, sport', 'type': 'vie courante', 'icon': 'fa-futbol-o' },
  { 'id': 'photo', 'label': 'Photos, disques, cassettes', 'type': 'vie courante', 'icon': 'fa-camera' },
  { 'id': 'cadeau', 'label': 'Cadeaux', 'type': 'vie courante', 'icon': 'fa-gift' },
  { 'id': 'enfant', 'label': 'Enfants (scolarité, extrascolaires...)', 'type': 'vie courante', 'icon': 'fa-child' },
  { 'id': 'liturgie', 'label': 'Culte et liturgie', 'type': 'vie courante', 'icon': 'myicon-chapelet' },
  { 'id': 'divers_vie', 'label': 'Divers vie courante (à préciser)', 'type': 'vie courante', 'icon': 'fa-leaf' },
  { 'id': 'voiture', 'label': 'Investissement voiture', 'type': 'transport', 'icon': 'fa-car' },
  { 'id': 'entretien_voiture', 'label': 'Entretien et réparations', 'type': 'transport', 'icon': 'fa-wrench' },
  { 'id': 'carburant', 'label': 'Carburant', 'type': 'transport', 'icon': 'myicon-gas-station' },
  { 'id': 'transport_commun', 'label': 'Transport en commun (train, bus, avion)', 'type': 'transport', 'icon': 'fa-bus' },
  { 'id': 'parking', 'label': 'Péage, parking, etc', 'type': 'transport', 'icon': 'fa-road' },
  { 'id': 'amende', 'label': 'Amendes, contraventions', 'type': 'transport', 'icon': 'myicon-police' },
  { 'id': 'assurance_voiture', 'label': 'Assurances, vignette, carte-grise, divers (à préciser)', 'type': 'transport', 'icon': 'fa-shield' },
  { 'id': 'affranchissement', 'label': 'Affranchissements', 'type': 'secretariat', 'icon': 'fa-envelope' },
  { 'id': 'telephone', 'label': 'Téléphone', 'type': 'secretariat', 'icon': 'fa-mobile' },
  { 'id': 'divers_secretariat', 'label': 'Secrétariat (à préciser)', 'type': 'secretariat', 'icon': 'fa-files-o' },
  { 'id': 'perte', 'label': 'Pertes, écarts de compte, agios bancaires', 'type': 'banque', 'icon': 'fa-bank' },
  { 'id': 'frais_banque', 'label': 'Frais bancaires', 'type': 'banque', 'icon': 'fa-bank' },
  { 'id': 'avance_retournee', 'label': 'Avance retournée ou solde feuille jaune', 'type': 'banque', 'icon': 'fa-money' }];
  private readonly categories_in = [{ 'id': 'salaire', 'label': 'Salaires, honoraires, pensions,retraites', 'icon': 'fa-money' },
  { 'id': 'allocation', 'label': 'Allocations familiales, bourses…', 'icon': 'fa-users' },
  { 'id': 'don', 'label': 'Dons...', 'icon': 'fa-gift' },
  { 'id': 'dime', 'label': 'Reversement des revenus, dons ou dîme', 'icon': 'myicon-tax' },
  { 'id': 'autre', 'label': 'Autres revenus (à détailler)', 'icon': 'fa-usd' },
  { 'id': 'remboursement_sante', 'label': 'Remboursement frais médicaux', 'icon': 'fa-medkit' },
  { 'id': 'remboursement_pro', 'label': 'Remboursement frais professionnels', 'icon': 'fa-black-tie' },
  { 'id': 'remboursement_autre', 'label': 'Autres remboursements (à préciser)', 'icon': 'myicon-money-bag' },
  { 'id': 'avance', 'label': 'Avance demandée à la MM ou à la Cté', 'icon': 'fa-money' },
  { 'id': 'epargne', 'label': 'Pour les fraternités de quartier : Epargne', 'icon': 'myicon-pig' },
  { 'id': 'transfert', 'label': 'Transfert banque/caisse', 'icon': 'fa-exchange' }];

  // == CHAMPS PHOTO ==
  // dans les champs photo, par défaut il va chercher sur bing images.
  // mais quand le champ vaut '@google:...', ça correspond à des images de google agenda
  public smart_categories = []

  public liste_maison = this.categories.filter(el => el.type == 'maison').map(el => el.id); //_.map(_.filter(this.categories, ['type', 'maison']), 'id');
  public liste_viecourante = this.categories.filter(el => el.type == 'vie courante').map(el => el.id); //_.map(_.filter(this.categories, ['type', 'vie courante']), 'id');
  public liste_transport = this.categories.filter(el => el.type == 'transport').map(el => el.id); //_.map(_.filter(this.categories, ['type', 'transport']), 'id');
  public liste_secretariat = this.categories.filter(el => el.type == 'secretariat').map(el => el.id); //_.map(_.filter(this.categories, ['type', 'secretariat']), 'id');
  public liste_banque = this.categories.filter(el => el.type == 'banque').map(el => el.id); //_.map(_.filter(this.categories, ['type', 'banque']), 'id');

  public currencies = []

  public maisons = []

  public init: any;
  public gauges: any; // min/max values for the gauges on home screen

  public personne: string;
  public maison: string;
  public currency: string;

  private CACHE = {
    photos_maisons: {}
  }

  constructor(private storage: Storage, private afs: AngularFirestore) {

    // these 2 lines fix the error for firebase : "The behavior for Date objects stored in Firestore is going to change AND YOUR APP MAY BREAK"
    // see here : https://stackoverflow.com/questions/50029307/getting-a-timestamp-error-in-an-angular-app-and-firebase-integration
    afs.app.firestore().settings({timestampsInSnapshots: true});
    afs.app.firestore().enablePersistence();

    this.initialize()

    // on récupère les variables d'initialisation
    this.storage.get("init").then(res => {
      this.init = res;
    }).catch(err => {
      console.log("No person found, using empty personne");
      this.init = { 'bienvenue_msg': true }
      this.storage.set("init", this.init);
    });

    // on récupère la personne si elle existe
    this.storage.get("personne").then(res => {
      this.personne = res;
    }).catch(err => {
      console.log("No person found, using empty personne");
      this.personne = ""
    });

    // on récupère la maison si elle existe
    this.storage.get("maison").then(res => {
      this.maison = res;
    }).catch(err => {
      console.log("No maison found, using empty maison");
      this.maison = ""
    });

    // on récupère la currency si elle existe
    this.storage.get("currency").then(res => {
      this.currency = res;
    }).catch(err => {
      console.log("No currency found, using euros (EUR)");
      this.currency = "EUR"
    })
  }

  initialize() {
    // maisons
    let maisonsCollection = this.afs.collection('maisons')
    let maisonsObs = maisonsCollection.valueChanges()
    maisonsObs.subscribe(data => this.maisons = this.prepareMaisons(data))

    // devises
    let currencyCollection = this.afs.collection('currencies')
    let currencyObs = currencyCollection.valueChanges()
    currencyObs.subscribe(data => this.currencies = data)

    // smart_categories
    let catCollection = this.afs.collection('smart_categories')
    let catObs = catCollection.valueChanges()
    catObs.subscribe(data => this.smart_categories = this.prepareSmartCategories(data))
  }

  getCategories() {
    return JSON.parse(JSON.stringify(this.categories))
  }

  getCategoriesIn() {
    return JSON.parse(JSON.stringify(this.categories_in))
  }

  // returns only when param attributes are all set
  async ready(n = 10) {
    if (n < 0) return false;
    if (this.maisons && this.maisons.length 
        && this.currencies && this.currencies.length
        && this.smart_categories && this.smart_categories.length) {
          return true
    } else {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.ready(n-1).then(r => resolve(r)).catch(err => reject(err))
        }, 500)
      })
    }
  }

  prepareSmartCategories(raw_cats) {
    for (let i = 0; i < raw_cats.length; i++) {
      raw_cats[i].regex = new RegExp(raw_cats[i].regex, 'gi')
    }
    return raw_cats
  }

  prepareMaisons(raw_maisons) {
    for (let i = 0; i < raw_maisons.length; i++) {
      let re = (raw_maisons[i].trig) ? `((^|\\s)${raw_maisons[i].trig}($|\\s)|${raw_maisons[i].regex})`: raw_maisons[i].regex;
      raw_maisons[i].regex = new RegExp(re, 'gi')
    }
    return raw_maisons
  }

  setInit(o) {
    this.init = o;
    return this.storage.set("init", o);
  }

  setMaison(val) {
    this.maison = val;
    return this.storage.set("maison", val);
  }

  setPersonne(val) {
    this.personne = val;
    return this.storage.set("personne", val);
  }

  setCurrency(val) {
    this.currency = val;
    return this.storage.set("currency", val);
  }

  get(key) {
    return this.storage.get(key)
  }

  raz() {
    let plist = []
    plist.push(this.setInit({ 'bienvenue_msg': true }))
    plist.push(this.setPersonne(''))
    plist.push(this.setMaison(''))
    plist.push(this.setCurrency('EUR'))
    return Promise.all(plist)
  }

  // renvoie 1 si @s est un trigramme de devise (genre 'EUR'), 
  // 2 si c'est un symbole de devise
  // -1 sinon
  isCurrency(s) {
    if (!this.currencies) {
      throw {err: 'No currencies loaded :(', fun: 'param.service > isCurrency'}
    }
    if (this.currencies.map(c => c.id).indexOf(s) >= 0) return 1
    if (this.currencies.map(c => c.symbol).indexOf(s) >= 0) return 2
    return -1
  }

  // renvoie un objet correspondant à la devise
  getCurrencyObj(devise_id) {
    if (devise_id === null) devise_id = this.currency;
    let c = this.currencies.find(curr => curr.id == devise_id)
    if (c) {
      c['label'] = `${c.name} ${c.symbol}`
      return c
    }
    return {}
  }

  symbolCurrency(devise = null) {
    // TODO delete this and use getCurrencyObj(...).symbol instead
    if (devise === null) devise = this.currency;
    let res = this.currencies.filter(el => el.id == devise);
    if (res && res.length && res[0] && res[0].symbol) return res[0].symbol;
    else return '.'
  }

  // recherche une photo pour la maison renseignée
  // /!\ Angular n'aime pas que le résultat renvoyé change tout le temps, donc on utilise le cache pour renvoyer toujours la mm photo
  getPhotoMaison(maison) {
    //console.log('maison photo CACHE', maison, this.maisons, this.CACHE)
    if (this.CACHE['photos_maisons'][maison]) return this.maisons.find(m => m.trig == this.CACHE['photos_maisons'][maison]).photos[0];
    for (let m of this.maisons) {
      if (maison.match(m.regex)) {
        let alea = Math.round(Math.random() * (m.photos.length -1))
        this.CACHE['photos_maisons'][maison] = m.trig;
        return m.photos[alea]
      }
    }
    return ''
  }

  guessCategory(nom) {
    for (let i = 0; i < this.smart_categories.length; i++) {
      if (this.smart_categories[i]['category']) {
        if (nom.match(this.smart_categories[i].regex)) return this.smart_categories[i]['category'];
      }
    }
    return ''
  }

  guessIcon(nom) {
    for (let i = 0; i < this.smart_categories.length; i++) {
      if (this.smart_categories[i]['icon']) {
        if (nom.match(this.smart_categories[i].regex)) return this.smart_categories[i]['icon'];
      }
    }
    return ''
  }

  // transforme @month en objet moment
  toMoment(month) {
    if (moment.isMoment(month)) return month;
    if (typeof month == 'string') return moment(month, 'YYYY-MM-DD')
    else throw "Error in paramService.toMoment : Not valid month " + month
  }

  // renvoie le label de la categorie @cat_id
  getCatLabel(cat_id) {
    let cat = this.categories.find(c => c.id == cat_id)
    if (cat) return cat.label;
    let cat_in = this.categories_in.find(c => c.id == cat_id)
    if (cat_in) return cat_in.label;
    //console.log('Error in getting category label for ', cat_id)
    return cat_id
  }

  /* // un peu comme _.values mais avec un champ id optionnel
  values(obj, show_id = false) {
    let arr = []
    for (let id in obj) {
      let o = JSON.parse(JSON.stringify(obj[id]))
      if (show_id) o.id = id;
      arr.push(o)
    }
    return arr
  } */

}
