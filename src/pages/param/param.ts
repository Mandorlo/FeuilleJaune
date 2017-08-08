import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

import { ParamService } from '../../services/param.service';
import { ExportService } from '../../services/export.service';

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
    public paramService: ParamService,
    public exportService: ExportService,
    public ptfm: Platform) {
  }

  ionViewDidLoad() {
    document.getElementById('file_picker_browser').addEventListener('change', this.import_core_browser.bind(this), false);
    console.log('ParamPage : Benedetto sia il tuo nome santissimo Signore');
  }

  enregistrer() {
    this.paramService.setPersonne(this.paramService.personne).catch(err => console.log("Error setting personne : ", err));
    this.paramService.setMaison(this.paramService.maison).catch(err => console.log("Error setting maison : ", err));
    this.paramService.setCurrency(this.paramService.currency).catch(err => console.log("Error setting currency : ", err));
    this.navCtrl.pop();
  }

  exporter() {
    this.exportService.exportDB();
  }

  importer() {
    // todo faire un alert confirmation
    if (this.ptfm.is('mobileweb')) {
      console.log("import from browser", this.ptfm.platforms())
      document.getElementById("file_picker_browser").click();
    } else if (this.ptfm.is('android')) {
      console.log("importing from android", this.ptfm.platforms());
      this.exportService.importDB();
    } else {
      alert("this platform : " + JSON.stringify(this.ptfm.platforms()) + " is not supported")
    }
  }

  import_core_browser(evt) {
    let files = evt.target.files;
    let file = files[0];
    let reader = new FileReader();
    let _this = this;
    reader.onload = (function(theFile) {
      return function(e) {
        let data = JSON.parse(e.target.result);
        if (_this.exportService.isValidDB(data)) {
          _this.exportService.importDBcore(data);
        } else {
          console.log("invalid db ", data)
        }
      }
    })(file)
    reader.readAsText(file);
  }

}
