import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AlertController, ModalController } from 'ionic-angular';
import { FjObservationsPage } from '../../pages/fj-observations/fj-observations';

import { ParamService } from '../../services/param.service';
// import { CurrencyPipe } from '../../pipes/currency';


@Component({
  selector: 'fj-line',
  templateUrl: 'fj-line.html'
})
export class FjLineComponent {

  banqueValue: string;
  caisseValue: string;
  label: string;

  @Input('info') info:Object;
  @Input('important') important: boolean;
  @Input('line') line_num;
  @Input('category') category: string;
  @Input('banque') banque: string;
  @Output() banqueChange: EventEmitter<string> = new EventEmitter<string>();
  @Input('caisse') caisse: string;
  @Output() caisseChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() observations: string;
  @Output() observationsChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(public alertCtrl: AlertController, 
              private modalCtrl: ModalController,
              private paramService: ParamService) {
  }

  ngOnInit() {
    this.label = this.paramService.getCatLabel(this.category)
    if (!this.label) this.label = this.category
    //console.log('important', this.important, typeof this.important)
  }

  isMontantNonNul(m) {
    return (typeof m === "number" && m != 0 || typeof m === "string" && !isNaN(parseFloat(m)))
  }

  parseDecimal(n) {
    if (n === null) n = 0;
    return n
  }

  addComment(title) {
    if (!this.info) {
      console.log('les infos nécessaires n\'ont pas été récupérées ! : ', this.info)
      return
    }
    console.log('INFO', this.info)
    let opt = { 
      title, 
      category: this.category,
      currency: this.info['currency'],
      month: this.info['month'], 
      comments: this.observations 
    }
    let modalObservations = this.modalCtrl.create(FjObservationsPage, opt);
    modalObservations.onDidDismiss(data => {
      console.log("modal data = ", data);
      if (data !== undefined && data !== null) this.observationsChange.emit(data)
    });
    modalObservations.present();
  }

  addComment2(titre) {
    let prompt = this.alertCtrl.create({
      title: titre,
      message: "",
      inputs: [
        {
          name: 'observations',
          placeholder: 'Observations',
          value: this.observations
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          handler: data => {
            console.log('Ô mon âme bénis le Seigneur');
          }
        },
        {
          text: 'Ok',
          handler: data => {
            console.log('Saved clicked', data);
            this.observationsChange.emit(data.observations)
          }
        }
      ]
    });
    prompt.present();
  }

}
