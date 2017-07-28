import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import { ParamService } from '../../services/param.service';
import { FjService } from '../../services/fj.service';

import { ParamPage } from '../param/param';
import { FjgenPage } from '../fjgen/fjgen';

import moment from 'moment';


@Component({
  selector: 'page-fjmgmt',
  templateUrl: 'fjmgmt.html',
})
export class FjmgmtPage {
  private fj_list;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private toastCtrl: ToastController,
              public paramService: ParamService,
              public fjService: FjService) {
      this.fjService.getAllFJ().then(data => {
        this.fj_list = data;
        if (!data || !data.length) this.fj_list = [];
      }).catch(err => {
        console.log("Error retrieving list of FJs : ", err)
      })
  }

  ionViewDidLoad() {
    console.log('FjmgmtPage: Le Seigneur est mon berger, je ne manque de rien !');
  }

  presentToast(msg, temps=2000) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: temps
    });
    toast.present();
  }

  showFjPage() {
    if (!this.paramService.personne) {
      this.presentToast("Il faut spécifier une personne dans les paramètres");
      return
    } else if (!this.paramService.maison) {
      this.presentToast("Il faut spécifier une maison dans les paramètres");
      return
    }
    this.navCtrl.push(FjgenPage);
  }

  showParamPage() {
    this.navCtrl.push(ParamPage);
  }

}
