import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';

import { FjgenPage } from '../fjgen/fjgen';

import { FjService } from '../../services/fj.service';

import moment from 'moment';

/**
 * Generated class for the FjDetailsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-fj-details',
  templateUrl: 'fj-details.html',
})
export class FjDetailsPage {
  private curr_fj: Object;
  private loading: boolean = false;
  private pretty_month: string;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private fjService: FjService) {

    this.curr_fj = navParams.get("fj");
    this.pretty_month = moment(this.curr_fj['month']).format('MMMM YYYY')
    console.log('THIS FJ : ', this.curr_fj)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FjDetailsPage Lodato sia il Signore !');
  }

  presentToast(msg, temps = 2000) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: temps
    });
    toast.present();
  }

  // ouvre la page pour éditer cette Feuile Jaune
  editFJ() {
    console.log('edit fj', this.curr_fj['month'])
    this.navCtrl.push(FjgenPage, {"month": this.curr_fj['month']})
  }

  shareFJ() {
    this.loading = true
    this.fjService.shareFJ(this.curr_fj['month']).then(res => {
      this.presentToast("Feuille Jaune partagée ! Béni soit le Seigneur, Dieu de l'univers !");
      this.loading = false
    }).catch(err => {
      this.presentToast("Impossible de partager la feuille jaune :(");
      console.log(err);
      this.navCtrl.pop();
      this.loading = false
    });
  }

  supprFJ() {
    let alert = this.alertCtrl.create({
      title: 'Supprimer',
      message: 'Veux-tu vraiment supprimer la feuille jaune de ' + this.curr_fj['month'] + ' ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            console.log('Suppression de la feuille jaune annulée.');
          }
        },
        {
          text: 'Supprimer',
          handler: () => {
            console.log('Suppression de la feuille jaune');
            this.supprFJcore();
          }
        }
      ]
    });
    alert.present();
  }

  supprFJcore() {
    this.loading = true;
    this.fjService.deleteFJ([this.curr_fj]).then(res => {
      console.log("Delete completed !", res);
      this.navCtrl.pop();
      this.loading = false
    }).catch(err => {
      console.log("Error while deleting :(", err);
      this.navCtrl.pop();
      this.loading = false
    });
  }

}
