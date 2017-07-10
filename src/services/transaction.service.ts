import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb';
import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import cordovaWebsqlPlugin from 'pouchdb-adapter-websql';

@Injectable()
export class TransactionService {
  private _db;
  private _dbparam;
  private _transactions;
  public categories = [{ 'id': 'alimentation', 'label': 'Alimentation', 'type': 'maison' },
    { 'id': 'energie', 'label': 'Energie (électricité, gaz, ...)', 'type': 'maison' },
    { 'id': 'eau', 'label': 'Eau', 'type': 'maison' },
    { 'id': 'loyer', 'label': 'Loyers et charges', 'type': 'maison' },
    { 'id': 'impot_maison', 'label': 'Impôts locaux et taxes d\'habitation', 'type': 'maison' },
    { 'id': 'assurance_maison', 'label': 'Assurances maison', 'type': 'maison' },
    { 'id': 'entretien_maison', 'label': 'Entretien maison', 'type': 'maison' },
    { 'id': 'travaux', 'label': 'Equipement et travaux maison', 'type': 'maison' },
    { 'id': 'divers_maison', 'label': 'Divers frais maison (à préciser)', 'type': 'maison' },
    { 'id': 'habillement', 'label': 'Habillement', 'type': 'vie courante' },
    { 'id': 'formation', 'label': 'Retraites, formation adulte', 'type': 'vie courante' },
    { 'id': 'impot_personne', 'label': 'Impôts et taxes des personnes physiques', 'type': 'vie courante' },
    { 'id': 'sante', 'label': 'Dépenses de santé', 'type': 'vie courante' },
    { 'id': 'hygiene', 'label': 'Hygiène', 'type': 'vie courante' },
    { 'id': 'livre', 'label': 'Livres, journaux', 'type': 'vie courante' },
    { 'id': 'loisir', 'label': 'Loisirs, vacances, sport', 'type': 'vie courante' },
    { 'id': 'photo', 'label': 'Photos, disques ,cassettes', 'type': 'vie courante' },
    { 'id': 'cadeau', 'label': 'Cadeaux', 'type': 'vie courante' },
    { 'id': 'enfant', 'label': 'Enfants (scolarité, extrascolaires...)', 'type': 'vie courante' },
    { 'id': 'liturgie', 'label': 'Culte et liturgie', 'type': 'vie courante' },
    { 'id': 'divers_vie', 'label': 'Divers vie courante (à préciser)', 'type': 'vie courante' },
    { 'id': 'voiture', 'label': 'Investissement voiture', 'type': 'transport' },
    { 'id': 'entretien_voiture', 'label': 'Entretien et réparations', 'type': 'transport' },
    { 'id': 'carburant', 'label': 'Carburant', 'type': 'transport' },
    { 'id': 'transport_commun', 'label': 'Transport en commun (train, bus, avion)', 'type': 'transport' },
    { 'id': 'parking', 'label': 'Péage, parking, etc', 'type': 'transport' },
    { 'id': 'amende', 'label': 'Amendes, contraventions', 'type': 'transport' },
    { 'id': 'assurance_voiture', 'label': 'Assurances, vignette, carte-grise, divers (à préciser)', 'type': 'transport' },
    { 'id': 'affranchissement', 'label': 'Affranchissements', 'type': 'secretariat' },
    { 'id': 'telephone', 'label': 'Téléphone', 'type': 'secretariat' },
    { 'id': 'divers_secretariat', 'label': 'Secrétariat (à préciser)', 'type': 'secretariat' },
    { 'id': 'perte', 'label': 'Pertes, écarts de compte, agios bancaires', 'type': 'banque' },
    { 'id': 'frais_banque', 'label': 'Frais bancaires', 'type': 'banque' }];
  public categories_in = [{ 'id': 'salaire', 'label': 'Salaires, honoraires, pensions,retraites' },
    { 'id': 'allocation', 'label': 'Allocations familiales, bourses…' },
    { 'id': 'don', 'label': 'Dons...' },
    { 'id': 'dime', 'label': 'Reversement des revenus, dons ou dîme' },
    { 'id': 'autre', 'label': 'Autres revenus (à détailler)' },
    { 'id': 'remboursement_sante', 'label': 'Remboursement frais médicaux' },
    { 'id': 'remboursement_pro', 'label': 'Remboursement frais professionnels' },
    { 'id': 'remboursement_autre', 'label': 'Autres remboursements (à préciser)' },
    { 'id': 'avance', 'label': 'Avance demandée à la MM ou à la Cté' },
    { 'id': 'epargne', 'label': 'Pour les fraternités de quartier : Epargne' },
    { 'id': 'transfert', 'label': 'Transfert banque/caisse' }];

  initDB() {
    let myAdapter = "cordova-sqlite";
    if (window && (<any>window).cordova) {
      PouchDB.plugin(cordovaSqlitePlugin);
      console.log("Loaded PouchDB SQLite adapter for Mobile Cordova")
    }
    else {
      PouchDB.plugin(cordovaWebsqlPlugin);
      myAdapter = "websql";
      console.log("Loaded PouchDB WebSQL adapter for browser");
    }
    this._db = new PouchDB('transactions.db', { adapter: myAdapter });
    this._dbparam = new PouchDB('param.db', {adapter: myAdapter});
    // (<any>window).mydb = this._db;
  }

  add(transaction) {
    return this._db.post(transaction);
  }

  update(transaction) {
    return this._db.put(transaction);
  }

  delete(transaction) {
    return this._db.remove(transaction);
  }

  private onDatabaseChange = (change) => {
    var index = this.findIndex(this._transactions, change.id);
    var transac = this._transactions[index];

    if (change.deleted) {
      if (transac) {
        this._transactions.splice(index, 1); // delete
      }
    } else {
      if (transac && transac._id === change.id) {
        this._transactions[index] = change.doc; // update
      } else {
        this._transactions.splice(index, 0, change.doc) // insert
      }
    }
  }

  // Binary search, the array is by default sorted by _id.
  private findIndex(array, id) {
    var low = 0, high = array.length, mid;
    while (low < high) {
      mid = (low + high) >>> 1;
      array[mid]._id < id ? low = mid + 1 : high = mid
    }
    return low;
  }

  getAll() {
    if (!this._transactions) {
      return this._db.allDocs({ include_docs: true })
        .then(docs => {

          // Each row has a .doc object and we just want to send an
          // array of birthday objects back to the calling controller,
          // so let's map the array to contain just the .doc objects.

          this._transactions = docs.rows.map(row => {
            // Dates are not automatically converted from a string.
            //row.doc.Date = new Date(row.doc.Date);
            return row.doc;
          });

          // Listen for changes on the database.
          this._db.changes({ live: true, since: 'now', include_docs: true }).on('change', this.onDatabaseChange);

          return this._transactions;
        });
    } else {
      // Return cached data as a promise
      return Promise.resolve(this._transactions);
    }
  }
}
