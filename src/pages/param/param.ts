import { Component } from '@angular/core';
import { NavController, NavParams, Platform, ToastController } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';

import { ParamService } from '../../services/param.service';
import { ExportService } from '../../services/export.service';






@Component({
  selector: 'page-param',
  templateUrl: 'param.html',
})
export class ParamPage {
  private version:string = "0.9.3";
  private loading_export:boolean = false;
  private loading_import:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public toastCtrl: ToastController,
    public paramService: ParamService,
    public appVersion: AppVersion,
    public exportService: ExportService,
    public ptfm: Platform) {
      this.appVersion.getVersionNumber().then(v => {
        console.log("AppVersion", v);
        this.version = v;
      }).catch(err => {
        console.log("Impossible de récupérer le num de version de l'app: ", err)
      });
  }

  ionViewDidLoad() {
    document.getElementById('file_picker_browser').addEventListener('change', this.import_core_browser.bind(this), false);
    console.log('ParamPage : Benedetto sia il tuo nome santissimo Signore');
    this.appVersion.getVersionNumber().then(v => {
      console.log("App Version", v);
      this.version = v;
    }).catch(err => {
      console.log("Impossible de récupérer le num de version de l'app: ", err)
    });
  }

  showToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  enregistrer() {
    this.paramService.setPersonne(this.paramService.personne).catch(err => console.log("Error setting personne : ", err));
    this.paramService.setMaison(this.paramService.maison).catch(err => console.log("Error setting maison : ", err));
    this.paramService.setCurrency(this.paramService.currency).catch(err => console.log("Error setting currency : ", err));
    this.navCtrl.pop();
  }

  exporter() {
    this.loading_export = true;
    this.exportService.exportDB().then(res => {
      this.showToast("Base de données exportée ! Merci Seigneur de prendre soin de nous !");
      this.loading_export = false;
    }).catch(err => {
      console.log("DB export failed : ", err);
      this.loading_export = false;
    });
  }

  importer() {
    // todo faire un alert confirmation
    this.loading_import = true;
    if (this.ptfm.is('mobileweb')) {
      console.log("import from browser", this.ptfm.platforms())
      document.getElementById("file_picker_browser").click();
    } else if (this.ptfm.is('android')) {
      console.log("importing from android", this.ptfm.platforms());
      this.exportService.importDB().then(res => {
        this.loading_import = false;
      }).catch(err => {
        this.loading_import = false;
      });
    } else {
      alert("this platform : " + JSON.stringify(this.ptfm.platforms()) + " is not supported")
      this.loading_import = false;
    }
  }

  import_core_browser(evt) {
    let files = evt.target.files;
    let file = files[0];
    let reader = new FileReader();
    let mythis = this;
    reader.onload = (function(theFile) {
      return function(e) {
        let data = JSON.parse(e.target.result);
        if (mythis.exportService.isValidDB(data)) {
          mythis.exportService.importDBcore(data);
        } else {
          console.log("invalid db ", data)
        }
      }
    })(file)
    reader.readAsText(file);
    this.loading_import = false; // TODO le mettre plutôt qd importDBcore a terminé !
  }

}
