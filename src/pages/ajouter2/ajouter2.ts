import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, ToastController } from 'ionic-angular';
import { TransactionService } from '../../services/transaction.service';
import { ParamService } from '../../services/param.service';
// import { RadioSquareComponent } from '../../components/radio-square/radio-square';
import { DatePicker } from '@ionic-native/date-picker';
import moment from 'moment';
import _ from 'lodash';

@Component({
  selector: 'page-ajouter2',
  templateUrl: 'ajouter2.html',
})
export class Ajouter2Page {

  @ViewChild(Slides) slides: Slides;
  @ViewChild('inputmontant') myInput; // sert pour pouvoir mettre le focus automatiquement sur un input et afficher le clavier
  @ViewChild('categoryList') categoryList;

  private today: string = "";
  private cool_date: string = "";
  private pretty_moyen: string = "";
  private pretty_category: string = "";

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

  public is_valid_transaction: boolean = false;
  public error_validity_details = {};
  public last_slide_visited: boolean = false;

  public type_options = [{ 'val': 'out', 'title': 'Une dépense / sortie d\'argent', 'icon': 'fa-shopping-cart' },
    { 'val': 'in', 'title': "Un revenu / entrée d\'argent", 'icon': 'fa-trophy' },
    { 'val': 'retrait', 'title': 'Un retrait d\'argent au distributeur', 'icon': 'fa-money' },
    { 'val': 'depot', 'title': 'Un dépôt à la banque de mon argent liquide', 'icon': 'fa-bank' }];
  public moyen_options = [{ 'val': 'banque', 'title': this.moyen_titles.out.banque, 'icon': 'fa-credit-card' },
    { 'val': 'caisse', 'title': this.moyen_titles.out.caisse, 'icon': 'fa-money' }];
  public categories_options = [];

  public transaction_engine_ok: boolean = false;
  public transactions;
  public data_default = { 'name': '', 'type': 'out', 'moyen': 'banque', 'montant': 0.0, 'currency': 'EUR', 'date': moment().format('YYYY-MM-DD'), 'category': '', 'comment': '' }
  public data = JSON.parse(JSON.stringify(this.data_default));

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private transactionService: TransactionService,
    private paramService: ParamService,
    private datePicker: DatePicker) {
    moment.locale('fr');
    this.today = moment().format("dddd DD MMMM YYYY");
    this.categories_options = _.map(this.paramService.categories, el => {
      return { 'val': el.id, 'title': el.label, 'icon': el.icon }
    });

    // on initialise les currencies et la currency à utiliser lorsqu'on ajoute des transactions
    this.data.currency = (paramService.currency) ? paramService.currency : 'EUR';

    transactionService.getAll().then(data => {
      this.transactions = data;
      if (typeof data != 'object' || !data || !data.length) this.transactions = [];
      this.data.name = this.genNewTransactionName();
      this.transaction_engine_ok = true;
    }).catch(err => {
      console.log(err);
      console.log("creating new empty transactions list");
      this.transactionService.set([]).then(_ => {
        this.transactions = [];
        this.transaction_engine_ok = true;
      }).catch(err => {
        console.log(err);
        this.transaction_engine_ok = false;
      })
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Ajouter2Page. Le Seigneur est mon berger je ne manque de rien !');
  }

  enregistrer() {
    if (!this.validateData()) {
      this.presentToast("Les données rentrées sont invalides ou incomplètes :(");
      return
    }
    // on fait l'intelligent fix :
    this.intelligentFix();

    // on sauve dans la database
    console.log("tr à enregistrer : ", this.data);

    // on ecrit la devise dans les paramètres si elle n'est pas définie
    if (!this.paramService.currency && this.data.currency) this.paramService.setCurrency(this.data.currency);

    this.transactions.push(this.data);
    this.transactionService.add(this.data)
      .then(d => {
        // on affiche un petit toast :)
        this.presentToast("La transaction a été enregistrée, merci Seigneur !");
        this.navCtrl.pop();
      })
      .catch(err => {
        console.log(err);
        this.presentToast(JSON.stringify(err));
      });
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
      // this.myInput.setFocus();
    } else if (this.slides.getActiveIndex() == 3) { // montant
      if (this.data.montant <= 0) {
        this.presentToast("Le montant ne peut pas être nul");
        // this.slides.slideTo(2, 200);
      } else {
        if (this.data.type == "in") {
          this.categories_options = _.map(this.paramService.categories_in, el => {
            return { 'val': el.id, 'title': el.label, 'icon': el.icon }
          });
        } else if (this.data.type == 'out') {
          this.categories_options = _.map(this.paramService.categories, el => {
            return { 'val': el.id, 'title': el.label, 'icon': el.icon }
          });
        } else {
          this.categories_options = [];
        }
      }
    } else if (this.slides.getActiveIndex() == 5) { // category list
      if (this.data.category != '') {
        let ind = this.categories_options.findIndex(e => e.val == this.data.category)
        if (ind > 4) this.categoryList._scrollContent.nativeElement.scrollTop = ind * 61;
      }
    } else if (this.slides.getActiveIndex() == 6) {
      this.last_slide_visited = true;
      this.cool_date = "le " + moment(this.data.date).format("dddd DD MMMM YYYY");
      if (moment(this.data.date).format("DDMMYY") == moment().format("DDMMYY")) this.cool_date = "aujourd'hui";
      this.pretty_moyen = "en liquide";
      if (this.data.category) {
        if (this.data.type == "out") this.pretty_category = _.find(this.paramService.categories, { 'id': this.data.category }).label;
        else if (this.data.type == 'in') this.pretty_category = _.find(this.paramService.categories_in, { 'id': this.data.category }).label;
      } else {
        this.pretty_category = "";
      }
      if (this.data.moyen == "banque" && this.data.type == "in") this.pretty_moyen = "sur mon compte bancaire";
      if (this.data.moyen == "banque" && this.data.type == "out") this.pretty_moyen = "par carte ou chèque";
      this.is_valid_transaction = this.validateData();
    }
  }

  setDateToday() {
    this.data.date = moment().format('YYYY-MM-DD');
    this.donePhase(4);
  }

  chooseDate() {
    this.datePicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      date => console.log('Got date: ', date),
      err => console.log('Error occurred while getting date: ', err)
      );
  }

  genNewTransactionName() {
    let names = _.map(this.transactions, 'name');
    let newname = "New";
    let i = 2;
    while (names.indexOf(newname) > -1) {
      newname = "New" + (i).toString();
      i++
    }
    return newname;
  }

  donePhase(n) {
    if (n == 0) {
      // 1ere phase : le type de transaction (in/out/retrait/depot)
      let ind_slide = n + 1;
      this.data.category = "";
      if (this.data.type != 'in' && this.data.type != 'out') {
        ind_slide++;
      } else { // alors on change un peu le texte
        let ind_banque = _.findIndex(this.moyen_options, function(o) { return o.val == 'banque'; });
        let ind_caisse = _.findIndex(this.moyen_options, function(o) { return o.val == 'caisse'; });
        this.moyen_options[ind_banque].title = this.moyen_titles[this.data.type]['banque'];
        this.moyen_options[ind_caisse].title = this.moyen_titles[this.data.type]['caisse'];
      }
      if (this.last_slide_visited) this.goToSlide(6); else this.goToSlide(ind_slide);

    } else if (n == 1) {
      // 2eme phase : le moyen de paiement
      if (this.last_slide_visited) this.goToSlide(6); else this.goToSlide(n + 1);

    } else if (n == 2) {
      // 3eme phase : le montant
      if (this.data.montant > 0) {
        if (this.last_slide_visited) {
          this.goToSlide(6);
        } else if (this.data.type != 'in' && this.data.type != 'out') {
          this.goToSlide(n + 2);
        } else {
          this.goToSlide(n + 1);
        }
      } else {
        this.presentToast("Il faut insérer un montant valide > 0 stp :)")
      }

    } else if (n == 3) {
      // 4eme phase : le nom et le commentaire
      this.data.category = this.paramService.guessCategory(this.data.name) // on essaie de deviner la catégorie à partir du nom rentré
      if (this.last_slide_visited) this.goToSlide(6); else this.goToSlide(n + 1);

    } else if (n == 4) {
      // 5eme phase : la date
      if (this.last_slide_visited) this.goToSlide(6); else this.goToSlide(n + 1);

    } else if (n == 5) {
      // 6eme phase : la catégorie
      if (this.last_slide_visited) this.goToSlide(6); else this.goToSlide(n + 1);

    } else {
      console.log("Phase " + n + ' inconnue');
    }
  }

  validateData() {
    this.error_validity_details = {};
    // check validity
    let montant_pasbon = (!this.data.montant || (typeof this.data.montant === 'number' && this.data.montant <= 0) || (typeof this.data.montant === 'string' && parseFloat(this.data.montant) <= 0));
    if (!this.data.category || montant_pasbon || !this.data.type || !this.data.name) {
      if (montant_pasbon) this.error_validity_details["montant"] = "Il faut spécifier un montant positif.";
      if (!this.data.type) this.error_validity_details["type"] = "Il faut spécifier un type de transaction (entrée/sortie).";
      if (!this.data.name) this.error_validity_details["nom"] = "Il faut donner un nom à la transaction";
      if (!this.data.category) {
        if (this.data.type != 'in' && this.data.type != 'out') { // si c'est un retrait ou un dépôt
          return !montant_pasbon && this.data.name;
        } else {
          this.error_validity_details["categorie"] = "Il faut spécifier une catégorie !";
          return false;
        }
      }
      return false
    }
    return true;
  }

  intelligentFix() {
    // intelligent fix of data

    if (typeof this.data.montant == 'string') this.data.montant = parseFloat(this.data.montant);

    // on fait un traitement spécial si on est dans le cas d'un retrait ou d'un dépôt d'argent
    if (this.data.type != 'in' && this.data.type != 'out') {
      // un transfert pour l'app c'est un retrait = montant négatif côté banque et un montant positif côté caisse
      // on enregistre toujours la transaction du point de vue de la banque, donc montant négatif si retrait et positif si dépôt
      this.data.moyen = 'banque';
      this.data.category = 'transfert';
      if (this.data.type == 'retrait') {
        // si c'est un retrait, l'utilisateur a mis un montant positif, mais en fait il faut enregistrer un montant négatif
        // car on enregistre toujours la transaction du point de vue de la banque
        this.data.montant = -this.data.montant;
      }
    }
  }

}
