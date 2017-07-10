import { Component } from '@angular/core';
import { DatePicker } from '@ionic-native/date-picker';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TransactionService } from '../../services/transaction.service';

import { ToastController } from 'ionic-angular';
import moment from 'moment';
import $ from 'jquery';

/**
 * Generated class for the AjouterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-ajouter',
  templateUrl: 'ajouter.html',
})
export class AjouterPage {

  public categories = this.transactionService.categories;
  public categories_in = this.transactionService.categories_in;

  data_default = { 'name': '', 'type': 'out', 'moyen': 'banque', 'montant': 0.0, 'date': moment().format('YYYY-MM-DD'), 'category': this.categories_in[0], 'comment': '' }
  data = JSON.parse(JSON.stringify(this.data_default));

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    private transactionService: TransactionService,
    private datePicker: DatePicker) {

      // this.categories = this.transactionService.categories;
      // this.categories_in = this.transactionService.categories_in;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AjouterPage');
  }

  change_type() {
    let titre = $(".titre_ajout");
    if (this.data.type === "out") {
      titre.text("Nouvelle dépense");
      this.data.category = this.categories[0];
    }
    else if (this.data.type === "in") {
      titre.text("Nouveau revenu");
      this.data.category = this.categories_in[0];
    }
  }

  presentToast() {
    let toast = this.toastCtrl.create({
      message: "Transaction enregistrée avec succès, merci Seigneur !",
      duration: 2000
    });
    toast.present();
  }

  showDatePicker() { // TODO check if still usefull
    this.datePicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      date => this.data.date = date,
      err => console.log('Error occurred while getting date: ', err)
      );
  }

  enregistrer() {
    console.log(this.data);
    // on sauve dans la database
    this.transactionService.add(this.data)
      .catch(console.error.bind(console));
    // on remet à zéro
    this.data = JSON.parse(JSON.stringify(this.data_default));
    // on affiche un petit toast :)
    this.presentToast();
  }

}
