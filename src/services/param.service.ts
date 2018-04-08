import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import _ from 'lodash';

@Injectable()
export class ParamService {

  public categories = [{ 'id': 'alimentation', 'label': 'Alimentation', 'type': 'maison', 'icon': 'fa-cutlery' },
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
    { 'id': 'voiture', 'label': 'Investissement voiture', 'type': 'transport', 'icon': 'fa-car'},
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
  public categories_in = [{ 'id': 'salaire', 'label': 'Salaires, honoraires, pensions,retraites', 'icon': 'fa-money' },
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

  public smart_categories = [
    {
      category: 'loisir',
      regex: /(^| )(vol|avion|flight|plane|aereo)/gi,
      icon: 'fa-plane'
    }, {
      category: 'loisir',
      regex: /(^| )(train|treno)/gi,
      icon: 'fa-train'
    }, {
      category: '',
      regex: /(^| )(foto|photo)/gi,
      icon: 'fa-camera'
    }, {
      category: 'hygiene',
      regex: /(^| )(hairdresser|coiffeur|parr?ucc?hiere)/gi,
      icon: 'fa-scissors'
    }, {
      category: 'loisir',
      regex: /(^| )(taxi|cab|uber|blablacar)/gi,
      icon: 'fa-cab'
    }, {
      category: 'transport_commun',
      regex: /(^| )(metro|subway|rer($|\s))/gi,
      icon: 'fa-subway'
    }, {
      category: 'loisir',
      regex: /(^| )(beer|bi[eè]re|birra|verre|bar)/gi,
      icon: 'fa-beer'
    }, {
      category: 'loisir',
      regex: /(^| )(h[oô]tel|bnb|auberge|albergo)/gi,
      icon: 'fa-bed'
    }, {
      category: 'loisir',
      regex: /(^| )(boat|bateau|battello|voile)/gi,
      icon: 'fa-anchor'
    }, {
      category: 'livre',
      regex: /(^| )(book|livre|libro)/gi,
      icon: 'fa-book'
    }, {
      category: 'loisir',
      regex: /(^| )(pizza)/gi,
      icon: 'myicon-pizza'
    }, {
      category: 'livre',
      regex: /(^| )(bible|bibbia)/gi,
      icon: 'myicon-bible'
    }, {
      category: 'liturgie',
      regex: /(^| )(magnificat|prions en [eé]glise)/gi,
      icon: 'myicon-bible'
    }, {
      category: 'liturgie',
      regex: /(^| )(messe)/gi,
      icon: ''
    }, {
      category: 'alimentation',
      regex: /(^| )(biscuit|biscott)/gi,
      icon: 'myicon-biscuit'
    }, {
      category: 'alimentation',
      regex: /(^| )(eau|water|acqua|milk|lait|latte|coca|sprite|jus|succo)/gi,
      icon: 'myicon-bottle'
    }, {
      category: 'alimentation',
      regex: /(^| )(brioche|dolc[ei]|gateau|torta|cake|muffin|tarte)/gi,
      icon: 'myicon-muffin'
    }, {
      category: 'alimentation',
      regex: /(^| )(croissant|viennoiserie|pain|bread|pane|bageutte)/gi,
      icon: 'myicon-croissant'
    }, {
      category: 'alimentation',
      regex: /(^| )(coffee|caff?[eéè]|th?[eéè]($| ))/gi,
      icon: 'myicon-coffee'
    }, {
      category: 'alimentation',
      regex: /(^| )(choco|ciocco)/gi,
      icon: 'myicon-chocolate'
    }, {
      category: 'alimentation',
      regex: /(^| )(panin|sandwich|hamburger)/gi,
      icon: 'myicon-hamburger'
    }, {
      category: 'hygiene',
      regex: /(^| )(dentifric|brosse [aà] dent|spazzolin|toothpaste|toothbrush)/gi,
      icon: 'myicon-toothpaste'
    }, {
      category: 'habillement',
      regex: /(^| )(slip|cale[cç]on|culotte)/gi,
      icon: 'myicon-underpants'
    }, {
      category: 'sante',
      regex: /(^| )(medicament|medicin|antibio)/gi,
      icon: 'myicon-medicament'
    }, {
      category: 'sante',
      regex: /(^| )(pansement|bandage|garza|cerott)/gi,
      icon: 'myicon-bandage'
    }, {
      category: 'hygiene',
      regex: /(^| )(d[ée]o($| |dorant)|ddt)/gi,
      icon: 'myicon-deodorant'
    }, {
      category: 'habillement',
      regex: /(^| )(shirt|chemis|camic[ei])/gi,
      icon: 'myicon-shirt'
    }, {
      category: 'habillement',
      regex: /(^| )(pantalon|trouser)/gi,
      icon: 'myicon-trousers'
    }, {
      category: 'habillement',
      regex: /(^| )(chaussette|calzett|calzin)/gi,
      icon: 'myicon-socks'
    }, {
      category: 'habillement',
      regex: /(^| )(chaussure|scarp|shoe|sandal)/gi,
      icon: 'myicon-shoe'
    }, {
      category: 'habillement',
      regex: /(^| )(montre|orologio|watch($| ))/gi,
      icon: 'myicon-watch'
    }, {
      category: 'loisir',
      regex: /(^| )(r[ei]st(au|o)rant)/gi,
      icon: ''
    }, {
      category: 'hygiene',
      regex: /(^| )(rasoir|rasoi)/gi,
      icon: ''
    }, {
      category: 'alimentation',
      regex: /(^| )(confiture|marmelade|marmellata)/gi,
      icon: ''
    }, {
      category: 'hygiene',
      regex: /(^| )(shampoo)/gi,
      icon: ''
    }, {
      category: 'alimentation',
      regex: /(^| )(h[uo]mm?[uo]s)/gi,
      icon: ''
    }, {
      category: 'alimentation',
      regex: /(^| )(graine|mandorl|amande|arachide|noix|noci|cachu[eè]te|peanut)/gi,
      icon: ''
    }, {
      category: 'transport_commun',
      regex: /(^| )(v[eé]lib|v[ée]lo\'?v|v[ée]lhop)/gi,
      icon: 'fa-bicycle'
    }, {
      category: 'divers_vie',
      regex: /(^| )(ordi|laptop|computer)/gi,
      icon: 'fa-laptop'
    }, {
      category: 'divers_vie',
      regex: /(^| )(smartphone|iphone|portable)/gi,
      icon: 'fa-mobile'
    }, {
      category: 'energie',
      regex: /(^| )([ée]l[ée]ctricit[eé]|gaz|electricity|gas($| )|elettricit)/gi,
      icon: ''
    }, {
      category: 'carburant',
      regex: /(^| )(essence|benzin|diesel|carburant)/gi,
      icon: ''
    }, {
      category: 'divers_vie',
      regex: /(^| )(cart[ea] d?\'? ?identit|id card|pass[ae]?port|driver license|permis de conduire|patent)/gi,
      icon: 'fa-id-card'
    }, {
      category: 'divers_vie',
      regex: /(^| )(disque dur|hdd)/gi,
      icon: 'fa-hdd-o'
    }, {
      category: 'sante',
      regex: /(^| )(h[oô]pital|m[eé]decin|docteur|medico|cardiolog)/gi,
      icon: 'fa-heartbeat'
    }, {
      category: 'divers_vie',
      regex: /(^| )([ée]lectroni)/gi,
      icon: 'fa-microchip'
    }, {
      category: 'frais_banque',
      regex: /(^| )(carte (CB|d?e? ?cr[ée]dit|bancaire)|carta (di )?credito)/gi,
      icon: 'fa-credit-card'
    }
  ];

  public liste_maison = _.map(_.filter(this.categories, ['type', 'maison']), 'id');
  public liste_viecourante = _.map(_.filter(this.categories, ['type', 'vie courante']), 'id');
  public liste_transport = _.map(_.filter(this.categories, ['type', 'transport']), 'id');
  public liste_secretariat = _.map(_.filter(this.categories, ['type', 'secretariat']), 'id');
  public liste_banque = _.map(_.filter(this.categories, ['type', 'banque']), 'id');

  public currencies = [{
    id: 'EUR',
    name: 'Euros',
    symbol: '€'
  }, {
    id: 'USD',
    name: 'Dollars',
    symbol: '$'
  }, {
    id: 'ILS',
    name: 'Sheqels',
    symbol: '\u20AA'
  }, {
    id: 'BRL',
    name: 'Réal Brésilien',
    symbol: 'R$'
  }]

  public init:any;
  public gauges:any; // min/max values for the gauges on home screen

  public personne:string;
  public maison:string;
  public currency:string;

  constructor(private storage: Storage) {
    // on récupère les variables d'initialisation
    this.storage.get("init").then(res => {
      this.init = res;
    }).catch(err => {
      console.log("No person found, using empty personne");
      this.init = {'bienvenue_msg': true}
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

  symbolCurrency(devise = null) {
    if (devise === null) devise = this.currency;
    let res = this.currencies.filter(el => el.id == devise);
    if (res && res.length && res[0] && res[0].symbol) return res[0].symbol;
    else return '.'
  }

  guessCategory(nom) {
    for (let i = 0; i < this.smart_categories.length; i++) {
      if (nom.match(this.smart_categories[i].regex)) return this.smart_categories[i].category;
    }
    return ''
  }

  guessIcon(nom) {
    for (let i = 0; i < this.smart_categories.length; i++) {
      if (nom.match(this.smart_categories[i].regex)) return this.smart_categories[i].icon;
    }
    return ''
  }

}
