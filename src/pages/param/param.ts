import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ParamService } from '../../services/param.service';


/**
 * Generated class for the ParamPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-param',
  templateUrl: 'param.html',
})
export class ParamPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private paramService: ParamService,
              private zone: NgZone) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ParamPage');
  }

  enregistrer() {
    this.paramService.setParam("personne", this.paramService.personne).catch(err => console.log("Error setting personne : ",err));
    this.paramService.setParam("maison", this.paramService.maison).catch(err => console.log("Error setting maison : ",err));
    this.navCtrl.pop();
  }

}
