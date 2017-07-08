import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb';
import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';

@Injectable()
export class TransactionService {
  private _db;
  private _transactions;

  initDB() {
    PouchDB.plugin(cordovaSqlitePlugin);
    this._db = new PouchDB('transactions.db', { adapter: 'cordova-sqlite' });
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
      change.doc.Date = new Date(change.doc.Date);
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
            row.doc.Date = new Date(row.doc.Date);
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
