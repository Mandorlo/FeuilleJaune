import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class TransactionService {
  private key: string = "transactions";

  constructor(private storage: Storage) { }

  set(tr_list) {
    return this.storage.set(this.key, tr_list);
  }

  add(tr) {
    // TODO ?
  }

  delete(tr) {
    if (typeof tr == 'object') {
      return new Promise((resolve, reject) => {
        this.getAll().then(data => {
          if (typeof data != 'object' || !data.length) reject("le format de la base de données des transactions est corrompu, ou la base est vide");
          let newdata = [];
          let supprime:boolean = false;
          data.forEach(el => {
            if (el.montant == tr.montant && el.name == tr.name && el.date == tr.date) {
              supprime = true;
            } else {
              newdata.push(el)
            }
          });
          if (newdata.length == data.length) {
            reject("L'élément n'a pas été trouvé, rien n'a été supprimé")
          } else {
            this.set(newdata).then(_ => {
              resolve("Element supprimé")
            }).catch(err => {
              reject(err)
            })
          }
        }).catch(err => {
          reject(err)
        })
      })
    } else {
      console.log("problem, tr is not an object")
    }
  }

  getAll() {
    return this.storage.get(this.key)
  }
}
