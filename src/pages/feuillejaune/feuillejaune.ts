import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ToastController } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TransactionService } from '../../services/transaction.service';
import { ParamPage } from '../param/param';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import moment from 'moment';
import $ from 'jquery';
import _ from 'lodash';

declare var pdfMake: any;
pdfMake.vfs = pdfFonts.pdfMake.vfs;

/**
 * Generated class for the FeuillejaunePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-feuillejaune',
  templateUrl: 'feuillejaune.html',
})
export class FeuillejaunePage {
  public personne = "Carlo Baugé";
  public maison = "HTC";
  public transactions = [];
  public pdf_name = "FeuilleJaune.pdf";
  public pdf_url = "";
  public curr_month = moment().format("YYYY-MM-DD");
  public last_months = [];
  public liste_viecourante = _.map(_.filter(this.transactionService.categories, ['type', 'vie courante']), 'id');
  public liste_transport = _.map(_.filter(this.transactionService.categories, ['type', 'transport']), 'id');
  public liste_secretariat = _.map(_.filter(this.transactionService.categories, ['type', 'secretariat']), 'id');
  public liste_banque = _.map(_.filter(this.transactionService.categories, ['type', 'banque']), 'id');
  public fjdata;
  public fjdata_test; // fjdata rempli avec des données de test pour vérifier que l'export pdf est bien configuré

  constructor(private transactionService: TransactionService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    private zone: NgZone,
    private file: File,
    private platform: Platform,
    private socialSharing: SocialSharing) {

    // on prépare fjdata
    this.initFjdata();

    // // on prépare les listes par catégorie
    // this.liste_viecourante = _.map(_.filter(this.transactionService.categories, ['type', 'vie courante']), 'id');
    // this.liste_transport = _.map(_.filter(this.transactionService.categories, ['type', 'transport']), 'id');
    // this.liste_secretariat = _.map(_.filter(this.transactionService.categories, ['type', 'secretariat']), 'id');
  }

  debug() { // TODO remove
    console.log(this.fjdata);
  }

  initFjdata() {
    this.fjdata = { 'report_mois_precedent': { 'label': 'Report du mois précédent', 'banque': 0, 'caisse': 0, 'observations': '' } }
    this.fjdata_test = { 'report_mois_precedent': { 'label': 'Report du mois précédent', 'banque': 'report_mois_prec_B', 'caisse': 'report_mois_prec_C', 'observations': 'report_mois_prec_O' } }
    this.transactionService.categories.forEach(el => {
      this.fjdata[el.id] = { 'label': el.label, 'banque': 0, 'caisse': 0, 'observations': '' }
      this.fjdata_test[el.id] = { 'label': el.label, 'banque': el.id + '_B', 'caisse': el.id + '_C', 'observations': el.id + '_O' }
    });
    this.transactionService.categories_in.forEach(el => {
      this.fjdata[el.id] = { 'label': el.label, 'banque': 0, 'caisse': 0, 'observations': '' }
      this.fjdata_test[el.id] = { 'label': el.label, 'banque': el.id + '_B', 'caisse': el.id + '_C', 'observations': el.id + '_O' }
    });
    console.log(this.fjdata);
  }

  ionViewDidLoad() {
    moment.locale('fr');

    // on récupère la liste des last months
    for (let i = 0; i < 7; i++) {
      let mydate = moment(this.curr_month).subtract(i, 'months');
      this.last_months.push({ 'date': mydate.format("YYYY-MM-DD"), 'label': mydate.format('MMMM YYYY') })
    }

    // on load la db
    this.platform.ready().then(() => {
      this.transactionService.initDB();

      this.transactionService.getAll()
        .then(data => {
          this.zone.run(() => {
            this.transactions = data;
            // on calcule les montants du mois
            this.initFjdata();
            this.computeAmounts();
            console.log('ionViewDidLoad FeuillejaunePage');
          });
        })
        .catch(console.error.bind(console));
    });
  }

  showParamPage() {
    this.navCtrl.push(ParamPage);
  }

  computeAmounts() {
    // on va calculer pour le mois courant les dépenses/revenus

    // d'abord on trouve les dates limites du mois
    let date_start = moment(this.curr_month).startOf('month');
    let date_end = moment(this.curr_month).endOf('month');

    // ensuite on remet fjdata à zero
    this.initFjdata();

    // maintenant on peut calculer les montants
    for (let i = 0; i < this.transactions.length; i++) {
      let tr = this.transactions[i];
      if (moment(tr.date) >= date_start && moment(tr.date) <= date_end) {
        let res = tr.montant.match(/\-?\s*[0-9]+[\,\.]?[0-9]*/g);
        if (res && res[0] == tr.montant) {
          this.fjdata[tr.category][tr.moyen] += parseFloat(tr.montant.replace(',', '.').replace(/\s/g, ''));
        } else {
          console.log("string '" + tr.montant + "' for transaction " + tr._id + " (" + tr.category + ") is not a valid amount")
        }
      }
    }
  }

  soustotal1(banque_ou_caisse) {
    return this.fjdata.salaire[banque_ou_caisse] + this.fjdata.allocation[banque_ou_caisse] + this.fjdata.don[banque_ou_caisse];
  }
  soustotal_I(b_or_c) {
    return this.soustotal(b_or_c, ['salaire', 'allocation', 'don', 'dime', 'autre', 'remboursement_sante', 'remboursement_pro',
      'remboursement_autre', 'report_mois_precedent', 'avance', 'epargne', 'transfert'])

  }
  soustotal_II(b_or_c) {
    let liste = _.map(_.filter(this.transactionService.categories, ['type', 'maison']), 'id');
    return this.soustotal(b_or_c, liste)
  }
  soustotal_III(b_or_c) {
    if (!this.liste_viecourante) this.liste_viecourante = _.map(_.filter(this.transactionService.categories, ['type', 'vie courante']), 'id');
    return this.soustotal(b_or_c, this.liste_viecourante)
  }
  soustotal_IV(b_or_c) {
    if (!this.liste_transport) this.liste_transport = _.map(_.filter(this.transactionService.categories, ['type', 'transport']), 'id');
    return this.soustotal(b_or_c, this.liste_transport)
  }
  soustotal_V(b_or_c) {
    // if (!this.liste_secretariat) this.liste_secretariat = _.map(_.filter(this.transactionService.categories, ['type', 'secretariat']), 'id');
    return this.soustotal(b_or_c, this.liste_secretariat)
  }
  total(b_or_c) {
    return this.soustotal(b_or_c, _.map(this.transactionService.categories, 'id'))
  }
  soustotal(b_or_c, liste) {
    var soustotal = 0.0;
    for (let i = 0; i < liste.length; i++) {
      soustotal += parseFloat(this.fjdata[liste[i]][b_or_c])
    }
    return soustotal.toFixed(2);
  }

  prettyEuros(amount) {
    return amount + " €";
  }

  createFJ() {
    this.fjdata = this.fjdata_test; // TODO remove !!!!!!!
    this.createPdf().then((pdf) => {
      let blob = new Blob([pdf], { type: 'application/pdf' });
      this.file.checkFile(this.file.dataDirectory, this.pdf_name).then(exists => {
        if (exists) {
          this.file.removeFile(this.file.dataDirectory, this.pdf_name).then(res => {
            console.log("File remove : ", res);
            this.shareFJ(blob)
          }).catch(err => {
            console.log("Error removing existing pdf file at " + this.file.dataDirectory + "/" + this.pdf_name)
          })
        } else {
          this.shareFJ(blob)
        }
      }).catch(err => {
        console.log("Impossible checkFile, trying direct download...");
        this.pdf_url = URL.createObjectURL(blob);
        this.downloadBrowser(this.pdf_url)
      });
    }).catch(err => {
      console.log("Error creating pdf blob : ", err);
    })
  }

  shareFJ(blob) {
    this.file.writeFile(this.file.dataDirectory, this.pdf_name, blob, true).then(_ => {
      console.log("PDF file written in : " + this.file.dataDirectory + "/" + this.pdf_name);
      let sujet = "Feuille Jaune - " + this.personne + " - mois de " + moment(this.curr_month).format("MMMM - YYYY");
      this.socialSharing.share("", sujet, this.file.dataDirectory + "/" + this.pdf_name).then(e => {
        console.log("PDF sharing ok", e);
      }).catch(err => {
        if (err === false) {
          let toast = this.toastCtrl.create({
            message: "Feuille Jaune exportée ! Merci Seigneur de prendre soin de nous !",
            duration: 2000
          });
          toast.present();
        } else {
          console.log(err)
          let toast = this.toastCtrl.create({
            message: "Erreur pendant l'export de la Feuille Jaune : " + JSON.stringify(err),
            duration: 2000
          });
          toast.present();
        }
      });
    }).catch(err => {
      console.log("Failed writing PDF file : ", err);
      console.log("Trying to download PDF directly...");
      this.pdf_url = URL.createObjectURL(blob);
      this.downloadBrowser(this.pdf_url)
    })
  }

  createPdf() {
    return new Promise((resolve, reject) => {
      let dd = this.createDocumentDefinition();
      let pdf = pdfMake.createPdf(dd);

      pdf.getBase64((output) => {
        if (!output) console.log("PDF Base64 output is empty :(");
        else resolve(this.base64ToUint8Array(output));
      });
    })
  }

  downloadBrowser(data) {
    var element = document.createElement('a');
    // element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('href', data);
    element.setAttribute('download', this.pdf_name);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  base64ToUint8Array(base64) {
    var raw = atob(base64);
    var uint8Array = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) {
      uint8Array[i] = raw.charCodeAt(i);
    }
    return uint8Array;
  }

  createDDBody() {
    let body = [];
    // TODO pour créer le dd plus intelligemment...
  }

  createDocumentDefinition() {
    let dd = {
      pageSize: 'A4',
      info: {
        title: "Feuille Jaune"
      },
      pageMargins: [40, 20, 40, 20],
      content: [
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: [14, 2, '*', 60, 60, 120],

            body: [
              [{ text: '1', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'NOM:' + this.personne + ' - MOIS: ' + moment(this.curr_month).format('MM-YYYY'), style: "defaultStyle" }, { text: 'BANQUE', alignment: 'center', style: "defaultStyle" }, { text: 'CAISSE', alignment: 'center', style: 'defaultStyle' }, { text: 'OBSERVATIONS', style: 'defaultStyle' }],
              [{ text: '', style: 'line_num' }, { text: '', style: 'col_space' }, { 'text': 'ENTRÉES', style: ["header"] }, '', '', { text: 'Maison: ' + this.maison, margin: [0, 0, 0, 0], fontSize: 9 }],
              [{ text: '2', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Salaires, honoraires, pensions, retraites', style: ['categorie'] }, { text: this.prettyEuros(this.fjdata.salaire.banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata.salaire.caisse), style: 'montant' }, { text: this.fjdata.salaire.observations, style: 'observation' }],
              [{ text: '3', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Allocations familiales, bourses…', style: ['categorie'] }, { text: this.prettyEuros(this.fjdata.allocation.banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata.allocation.caisse), style: 'montant' }, { text: this.fjdata.allocation.observations, style: 'observation' }],
              [{ text: '4', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Dons…', style: ['categorie'] }, { text: this.prettyEuros(this.fjdata.don.banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata.don.caisse), style: 'montant' }, { text: this.fjdata.don.observations, style: 'observation' }],
              [{ text: '5', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'SOUS-TOTAL', style: ['section'] }, { text: this.soustotal1('banque'), style: 'montant_imp' }, { text: this.soustotal1('caisse'), style: 'montant_imp' }, { text: '', style: 'observation' }],
              [{ text: '6', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Reversement des revenus, dons ou dîme', style: ['categorie'] }, { text: this.prettyEuros(this.fjdata.dime.banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata.dime.caisse), style: 'montant' }, { text: this.fjdata.dime.observations, style: 'observation' }],
              [{ text: '7', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Autres revenus (à détailler)', style: ['categorie'] }, { text: this.prettyEuros(this.fjdata.autre.banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata.autre.caisse), style: 'montant' }, { text: this.fjdata.autre.observations, style: 'observation' }],
              [{ text: '8', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Remboursement frais médicaux', style: ['categorie'] }, { text: this.prettyEuros(this.fjdata.remboursement_sante.banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata.remboursement_sante.caisse), style: 'montant' }, { text: this.fjdata.remboursement_sante.observations, style: 'observation' }],
              [{ text: '9', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Remboursement frais professionnels', style: ['categorie'] }, { text: this.prettyEuros(this.fjdata.remboursement_pro.banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata.remboursement_pro.caisse), style: 'montant' }, { text: this.fjdata.remboursement_pro.observations, style: 'observation' }],
              [{ text: '11', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Autres remboursements (à préciser)', style: ['categorie'] }, { text: this.prettyEuros(this.fjdata.remboursement_autre.banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata.remboursement_autre.caisse), style: 'montant' }, { text: this.fjdata.remboursement_autre.observations, style: 'observation' }],
              [{ text: '12', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'REPORT DU MOIS PRÉCÉDENT', style: 'report' }, { text: this.prettyEuros(this.fjdata.report_mois_precedent.banque), style: 'montant_imp' }, { text: this.prettyEuros(this.fjdata.report_mois_precedent.caisse), style: 'montant_imp' }, { text: this.fjdata.report_mois_precedent.observations, style: 'observation' }],
              [{ text: '13', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Avance demandée à la MM ou à la Cté', style: ['categorie'] }, { text: this.prettyEuros(this.fjdata.avance.banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata.avance.caisse), style: 'montant' }, { text: this.fjdata.avance.observations, style: 'observation' }],
              [{ text: '14', style: 'line_num' }, { text: '', style: 'col_space' }, { text: '', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '15', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Pour les fraternités de quartier : Epargne', style: ['categorie'] }, { text: this.prettyEuros(this.fjdata.epargne.banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata.epargne.caisse), style: 'montant' }, { text: this.fjdata.epargne.observations, style: 'observation' }],
              [{ text: '16', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Transfert banque/caisse', style: ['categorie'] }, { text: this.prettyEuros(this.fjdata.transfert.banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata.transfert.caisse), style: 'montant' }, { text: this.fjdata.transfert.observations, style: 'observation' }],
              [{ text: '17', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'I - DISPONIBILITÉS DU MOIS', style: ['subsection'] }, { text: this.soustotal_I('banque'), style: 'montant_imp' }, { text: this.soustotal_I('caisse'), style: 'montant_imp' }, { text: '', style: 'observation' }],
              [{ text: '', style: 'line_num' }, { text: '', style: 'col_space' }, { 'text': 'SORTIES', style: ["header"] }, '', '', { text: '', margin: [0, 5, 0, 5] }],
              [{ text: '18', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Alimentation', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '19', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Energie : Electricité/Gaz (EDF/GDF), fuel', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '21', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Eau', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '22', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Loyers et charges', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '23', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Impôts locaux et taxes d\'habitation', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '24', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Assurances maison', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '25', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Entretien maison', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '29', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Equipement et travaux maison', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '30', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Alimentation', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'II - TOTAL MAISON', style: ['subsection'] }, { text: '', style: 'montant_imp' }, { text: '', style: 'montant_imp' }, { text: '', style: 'observation' }],
              [{ text: '32', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Habillement', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '33', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Retraites, formation adulte', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '34', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Impôts et taxes des personnes physiques', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '35', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Dépenses de santé', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '36', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Hygiène', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '37', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Livres, journaux', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '38', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Loisirs, vacances, sport', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '39', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Photos, disques, cassettes', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '40', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Cadeaux', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '41', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Enfants (scolarité, extrascolaires...)', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '42', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Culte et liturgie', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '43', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Divers vie courante (à préciser)', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '44', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'III - TOTAL VIE COURANTE', style: ['subsection'] }, { text: '', style: 'montant_imp' }, { text: '', style: 'montant_imp' }, { text: '', style: 'observation' }],
              [{ text: '45', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Investissement voiture', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '46', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Entretien et réparations', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '47', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Carburant', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '48', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Transport en commun (train, bus, avion)', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '49', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Péage, parking, etc', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '50', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Amendes, contraventions', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '51', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Assurances, vignette, carte-grise, divers (à préciser)', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '52', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'IV - TOTAL TRANSPORTS', style: ['subsection'] }, { text: '', style: 'montant_imp' }, { text: '', style: 'montant_imp' }, { text: '', style: 'observation' }],
              [{ text: '54', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Affranchissements', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '55', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Téléphone', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '56', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Secrétariat (à préciser)', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '57', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'V - TOTAL SECRÉTARIAT', style: ['subsection'] }, { text: '', style: 'montant_imp' }, { text: '', style: 'montant_imp' }, { text: '', style: 'observation' }],
              [{ text: '58', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Pertes, écarts de compte, agios bancaires', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '59', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Frais bancaires', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }],
              [{ text: '61', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Avance retournée ou solde feuille jaune', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: 'TOTAL BANQUE + CAISSE', style: 'total_banque_caisse' }],
              [{ text: '62', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'TOTAL DES SORTIES', style: 'total_sorties' }, { text: '', style: 'montant_imp' }, { text: '', style: 'montant_imp' }, { text: '', style: 'montant_imp' }],
              [{ text: '63', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'SOLDE (à reporter le mois suivant ligne 12)', style: 'solde' }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'montant' }]
            ]
          },
          layout: {
            hLineWidth: function(i, node) {
              return (i === 2 || i === 19 || i == 57) ? 2 : 1;
            },
            vLineWidth: function(i, node) {
              return (i === 0 || i == 3 || i == 4 || i == 5 || i === node.table.widths.length) ? 1 : 0;
            },
            hLineColor: function(i, node) {
              return (i === 2 || i === 19 || i == 57) ? 'black' : 'gray';
            },
            vLineColor: function(i, node) {
              return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
            },
            // paddingLeft: function(i, node) { return 4; },
            // paddingRight: function(i, node) { return 4; },
            // paddingTop: function(i, node) { return 2; },
            // paddingBottom: function(i, node) { return 2; },
            // fillColor: function (i, node) { return null; }
          }
        },
      ],
      styles: {
        header: {
          fontSize: 9,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 0]
        },
        report: {
          bold: true,
          fontSize: 8
        },
        section: {
          alignment: 'center',
          border: [false, false, false, false],
          fontSize: 8
        },
        subsection: {
          alignment: 'right',
          bold: true,
          fontSize: 8
        },
        line_num: {
          fontSize: 7
        },
        montant: {
          alignemnt: 'right',
          fontSize: 7
        },
        montant_imp: {
          fillColor: '#DDDDDD',
          alignment: 'right',
          fontSize: 7
        },
        observation: {
          fontSize: 7
        },
        categorie: {
          fontSize: 7
        },
        total_banque_caisse: {
          fillColor: '#DDDDDD',
          bold: true,
          fontSize: 7
        },
        total_sorties: {
          alignment: 'right',
          fontSize: 8,
          bold: true,
          fillColor: '#DDDDDD'
        },
        solde: {
          fontSize: 8,
          bold: true
        },
        defaultStyle: {
          fontSize: 9
        }
      }
    }

    return dd;
  }

}
