import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AlertController } from 'ionic-angular';

// import { CurrencyPipe } from '../../pipes/currency';


@Component({
  selector: 'fj-line',
  templateUrl: 'fj-line.html'
})
export class FjLineComponent {

  banqueValue: string;
  caisseValue: string;

  @Input('line') line_num;
  @Input('label') label: string;
  @Input('banque') banque: string;
  @Output() banqueChange: EventEmitter<string> = new EventEmitter<string>();
  @Input('caisse') caisse: string;
  @Output() caisseChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() observations: string;
  @Output() observationsChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(public alertCtrl: AlertController) { }

  isMontantNonNul(m) {
    return (typeof m === "number" && m != 0 || typeof m === "string" && !isNaN(parseFloat(m)))
  }

  parseDecimal(n) {
    if (n === null) n = 0;
    return n
  }

  addComment(titre) {
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
