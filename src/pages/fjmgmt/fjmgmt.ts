import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController } from 'ionic-angular';

import { ParamService } from '../../services/param.service';
import { FjService } from '../../services/fj.service';

import { ParamPage } from '../param/param';
import { FjgenPage } from '../fjgen/fjgen';

import moment from 'moment';
import _ from 'lodash';


@Component({
  selector: 'page-fjmgmt',
  templateUrl: 'fjmgmt.html',
})
export class FjmgmtPage {
  private fj_list;
  private multiple_selection:boolean = false; // pour afficher ou non les checkbox de sélection multiple
  private selected_fj = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              public paramService: ParamService,
              public fjService: FjService) {
      this.reload();
  }

  ionViewDidLoad() {
    console.log('FjmgmtPage: Le Seigneur est mon berger, je ne manque de rien !');
  }

  ionViewDidEnter() {
    this.reload();
  }

  reload() {
    this.fjService.getAllFJ().then(data => {
      this.fj_list = data;
      if (!data || !data.length) this.fj_list = [];
      this.fj_list = _.sortBy(this.fj_list, [(o) => {return o.month}])
    }).catch(err => {
      console.log("Error retrieving list of FJs : ", err)
    })
  }

  presentToast(msg, temps=2000) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: temps
    });
    toast.present();
  }

  showCheckboxes() { // affiche les checkbox pour sélectionner plusieurs feuilles jaunes
    this.multiple_selection = !this.multiple_selection;
  }

  showFjPage() {
    if (!this.paramService.personne) {
      this.presentToast("Il faut spécifier une personne dans les paramètres");
      this.navCtrl.push(ParamPage);
      return
    } else if (!this.paramService.maison) {
      this.presentToast("Il faut spécifier une maison dans les paramètres");
      this.navCtrl.push(ParamPage);
      return
    }
    this.navCtrl.push(FjgenPage);
  }

  selectFJ(fj) {
    // sélectionne une fj (checkbox)
    if (!this.isSelected(fj)) this.selected_fj.push(fj);
  }

  unselectFJ(fj) {
    // déselectionne une fj (checkbox)
    this.selected_fj = _.reject(this.selected_fj, (o) => {
      return o.month == fj.month
    })
  }

  isSelected(fj) { // checks if the fj in input has been selected
    let res = _.find(this.selected_fj, (o) => {
      return o.month == fj.month;
    });
    return res !== undefined;
  }

  supprFJ() {
    let alert = this.alertCtrl.create({
    title: 'Supprimer',
    message: 'Veux-tu vraiment supprimer les feuilles jaunes sélectionnées ?',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel',
        handler: () => {
          console.log('Suppression des feuilles jaunes annulée.');
        }
      },
      {
        text: 'Supprimer',
        handler: () => {
          console.log('Suppression des feuilles jaunes ', this.selected_fj);
          this.supprFJcore();
        }
      }
    ]
  });
  alert.present();
  }

  supprFJcore() {
    this.fj_list = _.xorBy(this.fj_list, this.selected_fj, 'month');
    this.fjService.deleteFJ(this.selected_fj);
    this.selected_fj = [];
    this.multiple_selection = false;
  }

  showParamPage() {
    this.navCtrl.push(ParamPage);
  }

}
