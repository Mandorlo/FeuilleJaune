import { Component, Input } from '@angular/core';
import { AlertController } from 'ionic-angular';



@Component({
  selector: 'gauge',
  templateUrl: 'gauge.html'
})
export class GaugeComponent {

  @Input('level') level;
  @Input('text') text;
  @Input('min') min;
  @Input('max') max;

  private strokeDash: string;

  constructor(private alertCtrl: AlertController) {

  }

  ngOnChanges(...args: any[]) {
    if (args[0].min) this.min = args[0].min.currentValue;
    if (args[0].max) this.max = args[0].max.currentValue;
    this.level = args[0].level.currentValue;
    this.updateGauge();
  }

  updateGauge() {
    // on détermine le max et min de la gauge
    let mini = parseInt(this.min);
    let maxi = parseInt(this.max);

    if (!isNaN(mini) && !isNaN(maxi)) {
      let v = Math.max(0, (parseInt(this.level) - mini) * 230 / (maxi - mini));
      v = Math.min(230, v);
      this.strokeDash = v.toString() + ", 500";
    } else {
      console.log("Impossible de parser mini=" + this.min + " et maxi=" + this.max);
    }
  }

  changeLimits() {
    // permet de modifier this.max
    let prompt = this.alertCtrl.create({
      title: "Changer le maximum de la jauge",
      message: "",
      inputs: [
        {
          name: 'max',
          placeholder: this.max,
          value: this.max
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
            console.log('Changing maximum...', data);
            let newmax = parseInt(data.max);
            if (!isNaN(newmax)) this.max = newmax;
            this.updateGauge();
          }
        }
      ]
    });
    prompt.present();
  }

}
