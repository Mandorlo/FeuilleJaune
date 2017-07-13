import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, ToastController } from 'ionic-angular';
import { TransactionService } from '../../services/transaction.service';
import { RadioSquareComponent } from '../../components/radio-square/radio-square';
import moment from 'moment';
import _ from 'lodash';

/**
 * Generated class for the Ajouter2Page page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-ajouter2',
  templateUrl: 'ajouter2.html',
})
export class Ajouter2Page {
  @ViewChild(Slides) slides: Slides;

  private nbPhases: number = 6;
  private traduction_type = { 'in': 'un revenu', 'out': 'une dépense', 'retrait': 'un retrait DAB', 'depot': "un dépôt en banque" };
  private moyen_titles = { // c'est le titre à mettre dans le radio-square si l'utilisateur a choisi data.type = 'in' ou 'out'
    'out': {
      'banque': 'J\'ai payé par carte ou chèque',
      'caisse': 'J\'ai payé en argent liquide'
    },
    'in': {
      'banque': 'J\'ai reçu de l\'argent en banque',
      'caisse': 'J\'ai reçu de l\'argent liquide'
    }
  };

  public type_options = [{ 'val': 'out', 'title': 'Une dépense / sortie d\'argent', 'icon': 'fa-shopping-cart' },
    { 'val': 'in', 'title': "Un revenu / entrée d\'argent", 'icon': 'fa-trophy' },
    { 'val': 'retrait', 'title': 'Un retrait d\'argent au distributeur', 'icon': 'fa-money' },
    { 'val': 'depot', 'title': 'Un dépôt à la banque de mon argent liquide', 'icon': 'fa-bank' }];
  public moyen_options = [{ 'val': 'banque', 'title': this.moyen_titles.out.banque, 'icon': 'fa-credit-card' },
    { 'val': 'caisse', 'title': this.moyen_titles.out.caisse, 'icon': 'fa-money' }];

  public data_default = { 'name': 'NewTransac', 'type': 'out', 'moyen': 'banque', 'montant': 0.0, 'date': moment().format('YYYY-MM-DD'), 'category': '', 'comment': '' }
  public data = JSON.parse(JSON.stringify(this.data_default));

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private transactionService: TransactionService, ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Ajouter2Page');
  }

  enregistrer() {
    if (!this.validateData()) {
      this.presentToast("Les données rentrées sont invalides ou incomplètes :(");
      return
    }
    // on sauve dans la database
    console.log("tr : ", this.data);
    this.transactionService.add(this.data)
      .then(d => {
        // on affiche un petit toast :)
        this.presentToast("La transaction a été enregistrée, merci Seigneur !");
      })
      .catch(console.error.bind(console));
    // on remet à zéro
    this.data = JSON.parse(JSON.stringify(this.data_default));
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  progress() {
    let num_slide = this.slides.getActiveIndex() + 1;
    return num_slide * 100 / this.nbPhases;
  }

  goToSlide(num) {
    setTimeout(_ => {
      // this.loadProgress += Math.round(100.0 / this.nbPhases);
      this.slides.slideTo(num, 200);
    }, 300);
  }

  slideChanged() {
    if (this.slides.getActiveIndex() == 2) {
      document.getElementById('input_montant').focus();
    } else if (this.slides.getActiveIndex() == 3) { // montant
      if (this.data.montant <= 0) {
        this.presentToast("Le montant ne peut pas être nul");
        this.slides.slideTo(2, 200);
      }
    } else if (this.slides.getActiveIndex() == 5) {
      document.getElementById("input_nom").focus();
    }
  }

  setDateToday() {
    this.data.date = moment().format('YYYY-MM-DD');
    this.donePhase(4);
  }

  donePhase(n) {
    if (n == 0) {
      // 1ere phase : le type de transaciton (in/out/retrait/depot)
      let ind_slide = n + 1;
      if (this.data.type != 'in' && this.data.type != 'out') {
        ind_slide++;
      } else { // alors on change un peu le texte
        let ind_banque = _.findIndex(this.moyen_options, function(o) { return o.val == 'banque'; });
        let ind_caisse = _.findIndex(this.moyen_options, function(o) { return o.val == 'caisse'; });
        this.moyen_options[ind_banque].title = this.moyen_titles[this.data.type]['banque'];
        this.moyen_options[ind_caisse].title = this.moyen_titles[this.data.type]['caisse'];
      }
      this.goToSlide(ind_slide)

    } else if (n == 1) {
      // 2eme phase : le moyen de paiement
      this.goToSlide(n + 1);

    } else if (n == 2) {
      // 3eme phase : le montant
      if (this.data.montant > 0) {
        this.goToSlide(n + 1);
      } else {
        this.presentToast("Il faut insérer un montant valide > 0 stp :)")
      }

    } else if (n == 3) {
      // 4eme phase : la catégorie
      this.goToSlide(n + 1);

    } else if (n == 4) {
      // 5eme phase : la date
      this.goToSlide(n + 1);

    } else if (n == 5) {
      // 6eme phase : le nom et le commentaire
      this.goToSlide(n + 1);

    } else {
      console.log("Phase " + n + ' inconnue');
    }
  }

  validateData() {
    // check validity
    let montant_pasbon = (!this.data.montant || (typeof this.data.montant === 'number' && this.data.montant <= 0) || (typeof this.data.montant === 'string' && parseFloat(this.data.montant) <= 0));
    if (!this.data.category || montant_pasbon || !this.data.type || !this.data.name) {
      if (!this.data.category) console.log("Il faut spécifier une catégorie !");
      if (montant_pasbon) console.log("Il faut spécifier un montant positif !");
      if (!this.data.type) console.log("Il faut spécifier une entrée/sortie !");
      if (!this.data.name) console.log("Il faut spécifier un nom !");
      return false
    }

    // intelligent fix of data
    // on fait un traitement spécial si on est dans le cas d'un retrait ou d'un dépôt d'argent
    if (this.data.type != 'in' && this.data.type != 'out') {
      // un transfert pour l'app c'est un retrait = montant négatif côté banque et un montant positif côté caisse
      // on enregistre toujours la transaction du point de vue de la banque, donc montant négatif si retrait et positif si dépôt
      this.data.moyen = '';
      this.data.category = 'transfert';
      if (this.data.type == 'retrait') {
        // si c'est un retrait, l'utilisateur a mis un montant positif, mais en fait il faut enregistrer un montant négatif
        // car on enregistre toujours la transaction du point de vue de la banque
        this.data.montant = -this.data.montant;
      }
    }
  }

}
