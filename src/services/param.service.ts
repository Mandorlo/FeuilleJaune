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

  public liste_maison = _.map(_.filter(this.categories, ['type', 'maison']), 'id');
  public liste_viecourante = _.map(_.filter(this.categories, ['type', 'vie courante']), 'id');
  public liste_transport = _.map(_.filter(this.categories, ['type', 'transport']), 'id');
  public liste_secretariat = _.map(_.filter(this.categories, ['type', 'secretariat']), 'id');
  public liste_banque = _.map(_.filter(this.categories, ['type', 'banque']), 'id');

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

  symbolCurrency() {
    if (this.currency == "EUR") return "€";
    else if (this.currency == "USD") return "$";
    else return "."
  }


}
