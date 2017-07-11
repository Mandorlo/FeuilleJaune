import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ToastController } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TransactionService } from '../../services/transaction.service';
import { PdfService } from '../../services/pdf.service';
import { ParamService } from '../../services/param.service';
import { ParamPage } from '../param/param';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import moment from 'moment';
// import $ from 'jquery'; / TODO remove ?
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
  // public personne;
  // public maison;
  public transactions = [];
  public pdf_name = "FeuilleJaune.pdf";
  public pdf_url = "";
  public curr_month = moment().format("YYYY-MM-DD");
  public last_months = [];
  public liste_maison = _.map(_.filter(this.transactionService.categories, ['type', 'maison']), 'id');
  public liste_viecourante = _.map(_.filter(this.transactionService.categories, ['type', 'vie courante']), 'id');
  public liste_transport = _.map(_.filter(this.transactionService.categories, ['type', 'transport']), 'id');
  public liste_secretariat = _.map(_.filter(this.transactionService.categories, ['type', 'secretariat']), 'id');
  public liste_banque = _.map(_.filter(this.transactionService.categories, ['type', 'banque']), 'id');
  public fjdata;
  public fjdata_test; // fjdata rempli avec des données de test pour vérifier que l'export pdf est bien configuré

  constructor(private transactionService: TransactionService,
    private pdfService: PdfService,
    private paramService: ParamService,
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
    this.pdfService.rendereGrazie();
    this.paramService.initDB();
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
    let total = this.soustotal(b_or_c, ['salaire', 'allocation', 'don', 'dime', 'autre', 'remboursement_sante', 'remboursement_pro',
      'remboursement_autre', 'report_mois_precedent', 'avance', 'epargne', 'transfert']);
    // pour le cas de caisse, il ne faut pas compter this.fjdata.transfert.caisse, qui n'est pas défini, il faut compter -this.fjdata.transfert.banque
    if (b_or_c == 'caisse') return (parseFloat(total) - this.fjdata.transfert.banque).toString();
    return total;
  }
  soustotal_II(b_or_c) {
    return this.soustotal(b_or_c, this.liste_maison)
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
      if (this.fjdata[liste[i]][b_or_c] == "") this.fjdata[liste[i]][b_or_c] = 0;
      soustotal += parseFloat(this.fjdata[liste[i]][b_or_c])
    }
    return soustotal.toFixed(2);
  }

  prettyEuros(amount) {
    if (amount == "" || amount == 0) return "";
    return amount + " €";
  }

  createFJ() {
    // on complète fjdata avec les différents totaux
    this.fjdata.soustotal1_banque = this.soustotal1('banque');
    this.fjdata.soustotal1_caisse = this.soustotal1('caisse');
    this.fjdata.soustotal_I_banque = this.soustotal_I('banque');
    this.fjdata.soustotal_I_caisse = this.soustotal_I('caisse');
    this.fjdata.soustotal_II_banque = this.soustotal_II('banque');
    this.fjdata.soustotal_II_caisse = this.soustotal_II('caisse');
    this.fjdata.soustotal_III_banque = this.soustotal_III('banque');
    this.fjdata.soustotal_III_caisse = this.soustotal_III('caisse');
    this.fjdata.soustotal_IV_banque = this.soustotal_IV('banque');
    this.fjdata.soustotal_IV_caisse = this.soustotal_IV('caisse');
    this.fjdata.soustotal_V_banque = this.soustotal_V('banque');
    this.fjdata.soustotal_V_caisse = this.soustotal_V('caisse');
    this.fjdata.total_banque = this.total('banque');
    this.fjdata.total_caisse = this.total('caisse');
    this.fjdata.total_bc = (parseFloat(this.fjdata.total_banque) + parseFloat(this.fjdata.total_caisse)).toFixed(2);
    this.fjdata.solde_banque = parseFloat(this.soustotal_I('banque')) - parseFloat(this.total('banque'));
    this.fjdata.solde_caisse = parseFloat(this.soustotal_I('caisse')) - parseFloat(this.total('caisse'));
    this.fjdata.solde_bc = (parseFloat(this.fjdata.solde_banque) + parseFloat(this.fjdata.solde_caisse)).toFixed(2);

    // on prépare les options
    let opt = {
      'personne': this.paramService.personne,
      'maison': this.paramService.maison,
      'curr_month': this.curr_month,
      'filename': this.pdf_name
    }

    this.pdfService.createFJ(this.fjdata, opt);
  }

  // TODO delete everything that is below

  createFJ_old() {
    // this.fjdata = this.fjdata_test;
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
      let sujet = "Feuille Jaune - " + this.paramService.personne + " - mois de " + moment(this.curr_month).format("MMMM - YYYY");
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
    // important : on définit this.fjdata.transfert.caisse uniquement maintenant, pour la génération du pdf
    this.fjdata.transfert.caisse = -this.fjdata.transfert.banque;

    let line_nums = [];
    let body = [];
    body.push([{ text: '1', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'NOM: ' + this.paramService.personne + '  -  MOIS: ' + moment(this.curr_month).format('MM-YYYY'), style: "defaultStyle" }, { text: 'BANQUE', alignment: 'center', style: "defaultStyle" }, { text: 'CAISSE', alignment: 'center', style: 'defaultStyle' }, { text: 'OBSERVATIONS', style: 'defaultStyle' }]);

    // ENTREES
    body.push([{ text: '', style: 'line_num' }, { text: '', style: 'col_space' }, { 'text': 'ENTRÉES', style: ["header"] }, '', '', { text: 'Maison: ' + this.paramService.maison, margin: [0, 0, 0, 0], fontSize: 9 }]);
    ['salaire', 'allocation', 'don'].forEach((el,i) => {
      body.push([{ text: (i+2).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: this.fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(this.fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata[el].caisse), style: 'montant' }, { text: this.fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '5', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'SOUS-TOTAL', style: ['section'] }, { text: this.prettyEuros(this.soustotal1('banque')), style: 'montant_imp' }, { text: this.prettyEuros(this.soustotal1('caisse')), style: 'montant_imp' }, { text: '', style: 'observation' }]);
    line_nums = ['6', '7', '8', '9', '10', '12', '13'];
    ['dime', 'autre', 'remboursement_sante', 'remboursement_pro', 'remboursement_autre'].forEach((el,i) => {
      body.push([{ text: line_nums[i], style: 'line_num' }, { text: '', style: 'col_space' }, { text: this.fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(this.fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata[el].caisse), style: 'montant' }, { text: this.fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '12', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'REPORT DU MOIS PRÉCÉDENT', style: 'report' }, { text: this.prettyEuros(this.fjdata.report_mois_precedent.banque), style: 'montant_imp' }, { text: this.prettyEuros(this.fjdata.report_mois_precedent.caisse), style: 'montant_imp' }, { text: this.fjdata.report_mois_precedent.observations, style: 'observation' }])
    body.push([{ text: '13', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Avance demandée à la MM ou à la Cté', style: ['categorie'] }, { text: this.prettyEuros(this.fjdata.avance.banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata.avance.caisse), style: 'montant' }, { text: this.fjdata.avance.observations, style: 'observation' }]);
    body.push([{ text: '14', style: 'line_num' }, { text: '', style: 'col_space' }, { text: '', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }]);
    line_nums = ['15', '16'];
    ['epargne', 'transfert'].forEach((el,i) => {
      body.push([{ text: line_nums[i], style: 'line_num' }, { text: '', style: 'col_space' }, { text: this.fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(this.fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata[el].caisse), style: 'montant' }, { text: this.fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '17', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'I - DISPONIBILITÉS DU MOIS', style: ['subsection'] }, { text: this.prettyEuros(this.soustotal_I('banque')), style: 'montant_imp' }, { text: this.prettyEuros(this.soustotal_I('caisse')), style: 'montant_imp' }, { text: '', style: 'observation' }]);

    // SORTIES
    // SOUS-TOTAL MAISON
    body.push([{ text: '', style: 'line_num' }, { text: '', style: 'col_space' }, { 'text': 'SORTIES', style: ["header"] }, '', '', { text: '', margin: [0, 5, 0, 5] }]);
    line_nums = ['18', '19', '21', '22', '23', '24', '25', '29', '30'];
    this.liste_maison.forEach((el, i) => {
      body.push([{ text: line_nums[i], style: 'line_num' }, { text: '', style: 'col_space' }, { text: this.fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(this.fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata[el].caisse), style: 'montant' }, { text: this.fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'II - TOTAL MAISON', style: ['subsection'] }, { text: this.prettyEuros(this.soustotal_II('banque')), style: 'montant_imp' }, { text: this.prettyEuros(this.soustotal_II('caisse')), style: 'montant_imp' }, { text: '', style: 'observation' }]);

    // SOUS-TOTAL VIE COURANTE
    this.liste_viecourante.forEach((el, i) => {
      body.push([{ text: (i+32).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: this.fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(this.fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata[el].caisse), style: 'montant' }, { text: this.fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '44', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'III - TOTAL VIE COURANTE', style: ['subsection'] }, { text: this.prettyEuros(this.soustotal_III('banque')), style: 'montant_imp' }, { text: this.prettyEuros(this.soustotal_III('caisse')), style: 'montant_imp' }, { text: '', style: 'observation' }]);

    // SOUS-TOTAL TRANSPORT
    this.liste_transport.forEach((el, i) => {
      body.push([{ text: (i+45).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: this.fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(this.fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata[el].caisse), style: 'montant' }, { text: this.fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '52', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'IV - TOTAL TRANSPORT', style: ['subsection'] }, { text: this.prettyEuros(this.soustotal_IV('banque')), style: 'montant_imp' }, { text: this.prettyEuros(this.soustotal_IV('caisse')), style: 'montant_imp' }, { text: '', style: 'observation' }]);

    // SOUS-TOTAL SECRETARIAT
    this.liste_secretariat.forEach((el, i) => {
      body.push([{ text: (i+54).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: this.fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(this.fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata[el].caisse), style: 'montant' }, { text: this.fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '57', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'V - TOTAL SECRÉTARIAT', style: ['subsection'] }, { text: this.prettyEuros(this.soustotal_V('banque')), style: 'montant_imp' }, { text: this.prettyEuros(this.soustotal_V('caisse')), style: 'montant_imp' }, { text: '', style: 'observation' }]);

    // BANQUE
    ['perte', 'frais_banque'].forEach((el, i) => {
      body.push([{ text: (i+58).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: this.fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(this.fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata[el].caisse), style: 'montant' }, { text: this.fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '61', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Avance retournée ou solde feuille jaune', style: ['categorie'] }, { text: this.prettyEuros(this.fjdata.avance_retournee.banque), style: 'montant' }, { text: this.prettyEuros(this.fjdata.avance_retournee.caisse), style: 'montant' }, { text: 'TOTAL BANQUE + CAISSE', style: 'total_banque_caisse' }]);

    body.push([{ text: '62', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'TOTAL DES SORTIES', style: 'total_sorties' }, { text: this.prettyEuros(this.total('banque')), style: 'montant_imp' }, { text: this.prettyEuros(this.total('caisse')), style: 'montant_imp' }, { text: this.prettyEuros(parseFloat(this.total('caisse'))+parseFloat(this.total('banque'))), style: 'montant_imp' }]);
    body.push([{ text: '63', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'SOLDE (à reporter le mois suivant ligne 12)', style: 'solde' }, { text: this.prettyEuros(parseFloat(this.soustotal_I('banque'))-parseFloat(this.total('banque'))), style: 'montant' }, { text: this.prettyEuros(parseFloat(this.soustotal_I('caisse'))-parseFloat(this.total('caisse'))), style: 'montant' }, { text: this.prettyEuros(parseFloat(this.soustotal_I('banque'))-parseFloat(this.total('banque'))+parseFloat(this.soustotal_I('caisse'))-parseFloat(this.total('caisse'))), style: 'montant' }]);

    return body
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

            body: this.createDDBody()
          },
          layout: {
            hLineWidth: function(i, node) {
              return (i === 2 || i === 18 || i == 56) ? 2 : 1;
            },
            vLineWidth: function(i, node) {
              return (i === 0 || i == 3 || i == 4 || i == 5 || i === node.table.widths.length) ? 1 : 0;
            },
            hLineColor: function(i, node) {
              return (i === 2 || i === 18 || i == 56) ? 'black' : 'gray';
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
          alignment: 'right',
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
          bold: true,
          alignment: 'right'
        },
        defaultStyle: {
          fontSize: 9
        }
      }
    }

    return dd;
  }

}
