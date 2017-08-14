import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';

import { FjService } from '../../services/fj.service';

import { FjgenPage } from '../fjgen/fjgen';

import moment from 'moment';


@Component({
  selector: 'page-fjactions',
  templateUrl: 'fjactions.html',
})
export class FjactionsPage {
  private options = [{title: "Editer", val: "editer", "icon": "fa-pencil-square-o"},
                      {title: "Exporter en PDF", val: "pdf", "icon": "fa-file-pdf-o"},
                      {title: "Supprimer", val: "suppr", "icon": "fa-trash"}];
  private fj;
  private mois:string = "";

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private fjService: FjService) {
    this.fj = navParams.get("fj");
    console.log(this.fj);
    this.mois = moment(this.fj.month).format("MMMM YYYY");
  }

  ionViewDidLoad() {
    console.log('FjactionsPage: Lodato sia il Signore, dio dell\'universo !!!');
  }

  presentToast(msg, temps = 2000) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: temps
    });
    toast.present();
  }

  handleClick(o) {
    window.event.stopPropagation();
    if (o.val === "editer") {
      this.navCtrl.pop();
      this.navCtrl.push(FjgenPage, {"curr_fj": this.fj})
    } else if (o.val === "pdf") {
      this.fjService.shareFJ(this.fj.month).then(res => {
        this.presentToast("Feuille Jaune partagée ! Béni soit le Seigneur, Dieu de l'univers !");
        this.navCtrl.pop();
      }).catch(err => {
        this.presentToast("Impossible de partager la feuille jaune :(");
        console.log(err);
        this.navCtrl.pop();
      });
    } else if (o.val === "suppr") {
      this.supprFJ();
    } else {
      alert("L'option choisie n'est pas reconnue sorry :( Prie le Seigneur pour que j'apprenne à mieux coder :)")
    }
  }

  supprFJ() {
    let alert = this.alertCtrl.create({
      title: 'Supprimer',
      message: 'Veux-tu vraiment supprimer la feuille jaune de ' + this.mois + ' ?',
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
    this.fjService.deleteFJ([this.fj]).then(res => {
      console.log("Delete completed !", res);
      this.navCtrl.pop();
    }).catch(err => {
      console.log("Error while deleting :(", err);
      this.navCtrl.pop();
    });
  }

}
