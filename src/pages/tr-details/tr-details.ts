import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';

import { TransactionService } from '../../services/transaction.service';
import { ParamService } from '../../services/param.service';

import { DatePicker } from '@ionic-native/date-picker';

import moment from 'moment';
import * as pik from 'pikaday';

// TODO : delete tr


@Component({
  selector: 'page-tr-details',
  templateUrl: 'tr-details.html',
})
export class TrDetailsPage {
  @ViewChild('myPicker') mypicker;
  private pickerObject:any;

  private processing: boolean = false;
  private orig_tr: Object;
  private curr_tr: Object;
  private icon: string = "";
  private traduction_type = { 'in': 'Revenu', 'out': 'Dépense', 'retrait': 'Retrait', 'depot': "Dépôt" };
  private pretty: Object = { 'montant': "0 €", "date": "", "date2": "", "category": "", 'type': '' };

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    private datePicker: DatePicker,
    public paramService: ParamService,
    public trService: TransactionService) {
    this.curr_tr = navParams.get("tr");
    this.orig_tr = JSON.parse(JSON.stringify(this.curr_tr));
    this.icon = this.trService.smartIcon(this.curr_tr);
    this.pretty['montant'] = this.curr_tr['montant'].toString() + " " + this.paramService.symbolCurrency();
    this.pretty['date'] = moment(this.curr_tr["date"]).fromNow();
    this.pretty['date2'] = moment(this.curr_tr['date']).format("ddd D MMM YYYY");
    this.pretty['category'] = this.trService.categoryLabel(this.curr_tr);
    this.pretty['type'] = this.traduction_type[this.curr_tr['type']];
  }

  ionViewDidLoad() {
    console.log('TrDetailsPage : Signore, tu solo hai parole di vita eterna');
    this.setupDatePicker();
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  save() {
    this.processing = true;
    this.trService.delete(this.orig_tr).then(_ => {
      this.trService.getAll().then(data => {
        this.curr_tr['date'] = moment(this.curr_tr['date']).format("YYYY-MM-DD");
        data.push(this.curr_tr);
        this.trService.set(data).then(res => {
          console.log("Transaction updated !");
          this.presentToast("La transaction a été mise à jour, grazie Signore !")
          this.processing = false;
          this.navCtrl.pop();
        }).catch(err => {
          console.log("Error while updating transaction...", err)
          this.processing = false;
        })
      }).catch(err => {
        console.log("Error while updating transaction :(", err);
        this.processing = false;
      })
    }).catch(err => {
      console.log("Error while updating transaction : ", err);
      this.processing = false;
    })
  }

  delete() {
    let alert = this.alertCtrl.create({
      title: 'Supprimer',
      message: 'Veux-tu vraiment supprimer la transaction ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            console.log('Suppression de la transaction annulée.');
          }
        },
        {
          text: 'Supprimer',
          handler: () => {
            this.processing = true;
            console.log('Suppression de la transaction');
            this.trService.delete(this.orig_tr).then(_ => {
              console.log("Transaction supprimée !");
              this.presentToast("La transaction a bien été supprimée ! Thank you O Lord !")
              this.processing = false;
              this.navCtrl.pop();
            }).catch(err => {
              console.log(err)
              this.processing = false;
            })
          }
        }
      ]
    });
    alert.present();
  }

  changeDate() {
    this.datePicker.show({
      date: moment(this.curr_tr['date']).toDate(),
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      date => {
        console.log('Got date: ', date);
        this.curr_tr["date"] = moment(date).format("YYYY-MM-DD");
        this.pretty['date'] = moment(this.curr_tr["date"]).fromNow();
        this.pretty['date2'] = moment(this.curr_tr['date']).format("ddd D MMM YYYY");
      },
      err => {
        console.log('Error occurred while getting date: ', err);
        console.log("Trying with ionic datepicker...TODO");
        this.pickerObject.show();
      });
  }

  setupDatePicker() {
    let field:HTMLDivElement = this.mypicker.nativeElement;
    console.log("pik", field, this.mypicker);
    let mythis = this;
    this.pickerObject = new pik({
      field: this.mypicker.nativeElement,
      defaultDate: moment(mythis.curr_tr["date"]),
      onSelect: function(date) {
        console.log("pikaday: ", date);
        mythis.curr_tr["date"] = moment(date).format("YYYY-MM-DD");
        mythis.pretty['date'] = moment(date).fromNow();
        mythis.pretty['date2'] = moment(date).format("ddd D MMM YYYY");
      },
      format: 'D MMM YYYY'
    });
  }

}
