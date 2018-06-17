import { Component } from '@angular/core';
import { NavController, NavParams, Platform, ToastController, AlertController } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';

import { ParamService } from '../../services/param.service';
import { TransactionService } from '../../services/transaction.service';
import { FjService } from '../../services/fj.service';
import { ExportService } from '../../services/export.service';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-param',
  templateUrl: 'param.html',
})
export class ParamPage {
  private version:string = "0.11.0";
  private loading:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private afs: AngularFirestore,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public paramService: ParamService,
    public fjService: FjService,
    public trService: TransactionService,
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
    this.loading = true;
    this.exportService.exportDB().then(res => {
      this.showToast("Base de données exportée ! Merci Seigneur de prendre soin de nous !");
      this.loading = false;
    }).catch(err => {
      console.log("DB export failed : ", err);
      this.loading = false;
    });
  }

  importer() {
    // TODO faire un alert confirmation
    this.loading = true;
    if (this.ptfm.is('mobileweb') || this.ptfm.is('core')) {
      console.log("import from browser", this.ptfm.platforms())
      document.getElementById("file_picker_browser").click();
    } else if (this.ptfm.is('android')) {
      console.log("importing from android", this.ptfm.platforms());
      this.exportService.importDB().then(res => {
        this.loading = false;
      }).catch(err => {
        alert("Error during import, sorry :( " + JSON.stringify(err))
        this.loading = false;
      });
    } else {
      alert("this platform : " + JSON.stringify(this.ptfm.platforms()) + " is not supported")
      this.loading = false;
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
    this.loading = false; // TODO le mettre plutôt qd importDBcore a terminé !
  }

  raz() {
    let alert = this.alertCtrl.create({
      title: 'Supprimer',
      message: 'Veux-tu vraiment réinitialisées toutes les données de l\'application (cette action est irréversible) ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            console.log('RAZ annulée');
          }
        },
        {
          text: 'Réinitialiser',
          handler: () => {
            this.loading = true;
            console.log('Réinitialisation des données...');
            this.raz_core().then(_ => {
              this.presentToast("Toutes les données ont été réinitialisées ! Thank you O Lord !")
              this.loading = false
            }).catch(err => {
              console.log(err)
              this.loading = false
            })
          }
        }
      ]
    })
    alert.present()
  }

  raz_core() {
    this.loading = true
    let plist = []
    plist.push(this.trService.raz())
    plist.push(this.fjService.raz())
    plist.push(this.paramService.raz())
    return Promise.all(plist)
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

}
