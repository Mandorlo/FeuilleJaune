import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import { TransactionService } from '../../services/transaction.service';
import { ParamService } from '../../services/param.service';

import moment from 'moment';

/**
 * Generated class for the AjouterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-ajouter',
  templateUrl: 'ajouter.html',
})
export class AjouterPage {
  public transaction_engine_ok:boolean = false;
  public transactions;
  public categories;
  public categories_in;

  public data_default = { 'name': '', 'type': 'out', 'moyen': 'banque', 'montant': 0.0, 'date': moment().format('YYYY-MM-DD'), 'category': '', 'comment': '' }
  public data = JSON.parse(JSON.stringify(this.data_default));

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public toastCtrl: ToastController,
              private transactionService: TransactionService,
              private paramService: ParamService) {
      this.categories = paramService.categories;
      this.categories_in = paramService.categories_in;
      transactionService.getAll().then(data => {
        this.transactions = data;
        if (typeof data != 'object' || !data.length) this.transactions = [];
        this.transaction_engine_ok = true;
      }).catch(err => {
        console.log(err);
        console.log("creating new empty transactions list");
        this.transactionService.set([]).then(_ => {
          this.transactions = [];
          this.transaction_engine_ok = true;
        }).catch(err => {
          console.log(err);
          this.transaction_engine_ok = false;
        })
      })
  }

  ionViewDidLoad() {
    console.log('AjouterPage : lodato sia il Signore !');
  }

  presentToast(msg, delay=2000) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: delay
    });
    toast.present();
  }

  change_type() {
    let titre = document.getElementsByClassName("titre_ajout")[0];
    if (this.data.type === "out") {
      titre.innerHTML = "Nouvelle dépense";
      this.data.category = this.categories[0].id;
    }
    else if (this.data.type === "in") {
      titre.innerHTML = "Nouveau revenu";
      this.data.category = this.categories_in[0].id;
    }
  }

  enregistrer() {
    console.log(this.data);
    let montant_pasbon = (!this.data.montant || (typeof this.data.montant === 'number' && this.data.montant <= 0) || (typeof this.data.montant === 'string' && parseFloat(this.data.montant) <= 0));
    if (!this.data.category || montant_pasbon || !this.data.type || !this.data.name) {
      if (!this.data.category) console.log("Il faut spécifier une catégorie !");
      if (montant_pasbon) console.log("Il faut spécifier un montant positif !");
      if (!this.data.type) console.log("Il faut spécifier une entrée/sortie !");
      if (!this.data.name) console.log("Il faut spécifier un nom !");
      return
    }
    // on fait un traitement spécial si on est dans le cas d'un retrait ou d'un dépôt d'argent
    if (this.data.type != 'in' && this.data.type != 'out') {
      // un transfert pour l'app c'est un retrait = montant négatif côté banque et un montant positif côté caisse
      // on enregistre toujours la transaction du point de vue de la banque, donc montant négatif si retrait et positif si dépôt
      this.data.category = 'transfert';
      if (this.data.type == 'retrait') {
        // si c'est un retrait, l'utilisateur a mis un montant positif, mais en fait il faut enregistrer un montant négatif
        // car on enregistre toujours la transaction du point de vue de la banque
        this.data.montant = (-this.data.montant);
      }
    }
    if (typeof this.data.montant == 'string') this.data.montant = parseFloat(this.data.montant);
    // on sauve dans la database
    console.log("transactions : ",this.transactions);
    this.transactions.push(this.data);
    this.transactionService.set(this.transactions)
      .then(_ => {
        this.presentToast("Transaction enregistrée avec succès, merci Seigneur !");
        this.navCtrl.pop();
      }).catch(err => {
        console.log(err);
        this.presentToast(JSON.stringify(err));
      });
    // on remet à zéro
    this.data = JSON.parse(JSON.stringify(this.data_default));
    this.presentToast("Enregistrement en cours...", 500);
  }

}
