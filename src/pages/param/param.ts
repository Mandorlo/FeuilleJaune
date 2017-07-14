import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ParamService } from '../../services/param.service';

/**
 * Generated class for the ParamPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-param',
  templateUrl: 'param.html',
})
export class ParamPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public paramService: ParamService) {
  }

  ionViewDidLoad() {
    console.log('ParamPage : Benedetto sia il tuo nome santissimo Signore');
  }

  enregistrer() {
    this.paramService.setPersonne(this.paramService.personne).catch(err => console.log("Error setting personne : ",err));
    this.paramService.setMaison(this.paramService.maison).catch(err => console.log("Error setting maison : ",err));
    this.navCtrl.pop();
  }

}
