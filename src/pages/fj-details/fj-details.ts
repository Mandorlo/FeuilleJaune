import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';

import { FjgenPage } from '../fjgen/fjgen';

import { FjService } from '../../services/fj.service';
import { ParamService } from '../../services/param.service';

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
  @ViewChild('maison') maison;

  private curr_fj: Object;
  private fj_currencies: Array<Object>;
  private loading: boolean = false;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private fjService: FjService,
              private paramService: ParamService) {

    this.curr_fj = navParams.get("fj");
    this.fj_currencies = Object.getOwnPropertyNames(this.curr_fj['data']).map(c => this.paramService.getCurrencyObj(c))
    console.log('THIS FJ : ', this.curr_fj)
  }

  get pretty_month() {
    return moment(this.curr_fj['month'], 'YYYY-MM-DD').format('MMMM YYYY')
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FjDetailsPage Lodato sia il Signore !');
  }

  ngAfterViewInit() {
    let bg_img = this.paramService.getPhotoMaison(this.curr_fj['maison'])
    if (!bg_img) {
      bg_img = this.paramService.getPhotoMaison(this.curr_fj['maison'])
    }
    this.maison.nativeElement.style.backgroundImage = 'url(' + bg_img + ')';
  }

  presentToast(msg, temps = 2000) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: temps
    });
    toast.present();
  }

  // ouvre la page pour éditer cette Feuile Jaune
  editFJ(currency) {
    console.log('edit fj', this.curr_fj['month'], currency)
    this.navCtrl.push(FjgenPage, {
      "month": this.curr_fj['month'],
      //currency
    })
  }

  shareFJ() {
    this.loading = true
    this.fjService.shareFJ(this.curr_fj['month']).then(_ => {
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
