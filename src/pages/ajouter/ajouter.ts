import { Component } from '@angular/core';
import { DatePicker } from '@ionic-native/date-picker';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import moment from 'moment';
//import { Storage } from '@ionic/storage';
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

  categories = [{ 'id': 'alimentation', 'label': 'Alimentation' }, { 'id': 'energie', 'label': 'Energie (électricité, gaz, ...)' }];
  data_default = { 'name': '', 'type': 'out', 'montant': 0.0, 'date': moment().format('YYYY-MM-DD'), 'category': 'alimentation', 'comment': '' }
  data = JSON.parse(JSON.stringify(this.data_default));

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    private datePicker: DatePicker) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AjouterPage');
  }

  change_type() {
    let titre = $(".titre_ajout");
    if (this.data.type === "out") titre.text("Nouvelle dépense");
    else if (this.data.type === "in") titre.text("Nouveau revenu");
  }

  presentToast() {
    let toast = this.toastCtrl.create({
      message: "Transaction enregistrée avec succès, merci Seigneur !",
      duration: 2000
    });
    toast.present();
  }

  showDatePicker() {
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

    // on remet à zéro
    this.data = JSON.parse(JSON.stringify(this.data_default));
    // on affiche un petit toast :)
    this.presentToast();
  }

}
