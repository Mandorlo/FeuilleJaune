import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { ToastController } from 'ionic-angular';
import { TransactionService } from './transaction.service';
import { SocialSharing } from '@ionic-native/social-sharing';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import _ from 'lodash';
import moment from 'moment';

declare var pdfMake: any;
pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Injectable()
export class PdfService {
  public pdf_url;
  public liste_maison = _.map(_.filter(this.transactionService.categories, ['type', 'maison']), 'id');
  public liste_viecourante = _.map(_.filter(this.transactionService.categories, ['type', 'vie courante']), 'id');
  public liste_transport = _.map(_.filter(this.transactionService.categories, ['type', 'transport']), 'id');
  public liste_secretariat = _.map(_.filter(this.transactionService.categories, ['type', 'secretariat']), 'id');
  public liste_banque = _.map(_.filter(this.transactionService.categories, ['type', 'banque']), 'id');

  constructor(private transactionService: TransactionService,
              public toastCtrl: ToastController,
              private file: File,
              private socialSharing: SocialSharing) {
    moment.locale('fr');
  }

  rendereGrazie() {
    console.log("Lodato sia il Signore !")
  }

  private prettyEuros(amount) {
    if (amount == "" || amount == 0) return "";
    return amount + " €";
  }

  private manageDefaults(opt) {
    if (!opt) opt = {};
    if (!opt.personne) opt.personne = 'Carlo';
    if (!opt.path) opt.path = this.file.dataDirectory;
    if (!opt.filename) opt.filename = 'FeuilleJaune.pdf';
    if (!opt.curr_month) opt.curr_month = moment().format("YYYY-MM-DD");
    if (!opt.maison) opt.maison = "HTC";
    return opt;
  }

  createFJ(fjdata, opt) {
    // on gère les paramètres par défaut
    opt = this.manageDefaults(opt);

    // this.fjdata = this.fjdata_test;
    this.createPdf(fjdata, opt).then((pdf) => {
      let blob = new Blob([pdf], { type: 'application/pdf' });
      this.file.checkFile(opt.path, opt.filename).then(exists => {
        if (exists) {
          this.file.removeFile(opt.path, opt.filename).then(res => {
            console.log("File remove : ", res);
            this.shareFJ(blob, opt)
          }).catch(err => {
            console.log("Error removing existing pdf file at " + opt.path + "/" + opt.filename)
          })
        } else {
          this.shareFJ(blob, opt)
        }
      }).catch(err => {
        console.log("Impossible checkFile, trying direct download...");
        this.pdf_url = URL.createObjectURL(blob);
        this.downloadBrowser(this.pdf_url, opt)
      });
    }).catch(err => {
      console.log("Error creating pdf blob : ", err);
    })
  }

  private shareFJ(blob, opt) {
    // on gère les paramètres par défaut
    opt = this.manageDefaults(opt);

    this.file.writeFile(opt.path, opt.filename, blob, true).then(_ => {
      console.log("PDF file written in : " + opt.path + "/" + opt.filename);
      let sujet = "Feuille Jaune - " + opt.personne + " - mois de " + moment(opt.curr_month).format("MMMM - YYYY");
      this.socialSharing.share("", sujet, opt.path + "/" + opt.filename).then(e => {
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
      this.downloadBrowser(this.pdf_url, opt)
    })
  }

  public createPdf(fjdata, opt) {
    return new Promise((resolve, reject) => {
      let dd = this.createDocumentDefinition(fjdata, opt);
      let pdf = pdfMake.createPdf(dd);

      pdf.getBase64((output) => {
        if (!output) console.log("PDF Base64 output is empty :(");
        else resolve(this.base64ToUint8Array(output));
      });
    })
  }

  downloadBrowser(data, opt) {
    // on gère les paramètres par défaut
    opt = this.manageDefaults(opt);

    var element = document.createElement('a');
    // element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('href', data);
    element.setAttribute('download', opt.filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  private base64ToUint8Array(base64) {
    var raw = atob(base64);
    var uint8Array = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) {
      uint8Array[i] = raw.charCodeAt(i);
    }
    return uint8Array;
  }

  private createDDBody(fjdata, opt) {
    // important : on définit fjdata.transfert.caisse uniquement maintenant, pour la génération du pdf
    fjdata.transfert.caisse = -fjdata.transfert.banque;

    let line_nums = [];
    let body = [];
    body.push([{ text: '1', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'NOM: ' + opt.personne + '  -  MOIS: ' + moment(opt.curr_month).format('MM-YYYY'), style: "defaultStyle" }, { text: 'BANQUE', alignment: 'center', style: "defaultStyle" }, { text: 'CAISSE', alignment: 'center', style: 'defaultStyle' }, { text: 'OBSERVATIONS', style: 'defaultStyle' }]);

    // ENTREES
    body.push([{ text: '', style: 'line_num' }, { text: '', style: 'col_space' }, { 'text': 'ENTRÉES', style: ["header"] }, '', '', { text: 'Maison: ' + opt.maison, margin: [0, 0, 0, 0], fontSize: 9 }]);
    ['salaire', 'allocation', 'don'].forEach((el, i) => {
      body.push([{ text: (i + 2).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(fjdata[el].caisse), style: 'montant' }, { text: fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '5', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'SOUS-TOTAL', style: ['section'] }, { text: this.prettyEuros(fjdata.soustotal1_banque), style: 'montant_imp' }, { text: this.prettyEuros(fjdata.soustotal1_caisse), style: 'montant_imp' }, { text: '', style: 'observation' }]);
    line_nums = ['6', '7', '8', '9', '10', '12', '13'];
    ['dime', 'autre', 'remboursement_sante', 'remboursement_pro', 'remboursement_autre'].forEach((el, i) => {
      body.push([{ text: line_nums[i], style: 'line_num' }, { text: '', style: 'col_space' }, { text: fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(fjdata[el].caisse), style: 'montant' }, { text: fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '12', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'REPORT DU MOIS PRÉCÉDENT', style: 'report' }, { text: this.prettyEuros(fjdata.report_mois_precedent.banque), style: 'montant_imp' }, { text: this.prettyEuros(fjdata.report_mois_precedent.caisse), style: 'montant_imp' }, { text: fjdata.report_mois_precedent.observations, style: 'observation' }])
    body.push([{ text: '13', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Avance demandée à la MM ou à la Cté', style: ['categorie'] }, { text: this.prettyEuros(fjdata.avance.banque), style: 'montant' }, { text: this.prettyEuros(fjdata.avance.caisse), style: 'montant' }, { text: fjdata.avance.observations, style: 'observation' }]);
    body.push([{ text: '14', style: 'line_num' }, { text: '', style: 'col_space' }, { text: '', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }]);
    line_nums = ['15', '16'];
    ['epargne', 'transfert'].forEach((el, i) => {
      body.push([{ text: line_nums[i], style: 'line_num' }, { text: '', style: 'col_space' }, { text: fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(fjdata[el].caisse), style: 'montant' }, { text: fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '17', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'I - DISPONIBILITÉS DU MOIS', style: ['subsection'] }, { text: this.prettyEuros(fjdata.soustotal_I_banque), style: 'montant_imp' }, { text: this.prettyEuros(fjdata.soustotal_I_caisse), style: 'montant_imp' }, { text: '', style: 'observation' }]);

    // SORTIES
    // SOUS-TOTAL MAISON
    body.push([{ text: '', style: 'line_num' }, { text: '', style: 'col_space' }, { 'text': 'SORTIES', style: ["header"] }, '', '', { text: '', margin: [0, 5, 0, 5] }]);
    line_nums = ['18', '19', '21', '22', '23', '24', '25', '29', '30'];
    this.liste_maison.forEach((el, i) => {
      body.push([{ text: line_nums[i], style: 'line_num' }, { text: '', style: 'col_space' }, { text: fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(fjdata[el].caisse), style: 'montant' }, { text: fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'II - TOTAL MAISON', style: ['subsection'] }, { text: this.prettyEuros(fjdata.soustotal_II_banque), style: 'montant_imp' }, { text: this.prettyEuros(fjdata.soustotal_II_caisse), style: 'montant_imp' }, { text: '', style: 'observation' }]);

    // SOUS-TOTAL VIE COURANTE
    this.liste_viecourante.forEach((el, i) => {
      body.push([{ text: (i + 32).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(fjdata[el].caisse), style: 'montant' }, { text: fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '44', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'III - TOTAL VIE COURANTE', style: ['subsection'] }, { text: this.prettyEuros(fjdata.soustotal_III_banque), style: 'montant_imp' }, { text: this.prettyEuros(fjdata.soustotal_III_caisse), style: 'montant_imp' }, { text: '', style: 'observation' }]);

    // SOUS-TOTAL TRANSPORT
    this.liste_transport.forEach((el, i) => {
      body.push([{ text: (i + 45).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(fjdata[el].caisse), style: 'montant' }, { text: fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '52', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'IV - TOTAL TRANSPORT', style: ['subsection'] }, { text: this.prettyEuros(fjdata.soustotal_IV_banque), style: 'montant_imp' }, { text: this.prettyEuros(fjdata.soustotal_IV_caisse), style: 'montant_imp' }, { text: '', style: 'observation' }]);

    // SOUS-TOTAL SECRETARIAT
    this.liste_secretariat.forEach((el, i) => {
      body.push([{ text: (i + 54).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(fjdata[el].caisse), style: 'montant' }, { text: fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '57', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'V - TOTAL SECRÉTARIAT', style: ['subsection'] }, { text: this.prettyEuros(fjdata.soustotal_V_banque), style: 'montant_imp' }, { text: this.prettyEuros(fjdata.soustotal_V_caisse), style: 'montant_imp' }, { text: '', style: 'observation' }]);

    // BANQUE
    ['perte', 'frais_banque'].forEach((el, i) => {
      body.push([{ text: (i + 58).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: fjdata[el].label, style: ['categorie'] }, { text: this.prettyEuros(fjdata[el].banque), style: 'montant' }, { text: this.prettyEuros(fjdata[el].caisse), style: 'montant' }, { text: fjdata[el].observations, style: 'observation' }])
    });
    body.push([{ text: '61', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Avance retournée ou solde feuille jaune', style: ['categorie'] }, { text: this.prettyEuros(fjdata.avance_retournee.banque), style: 'montant' }, { text: this.prettyEuros(fjdata.avance_retournee.caisse), style: 'montant' }, { text: 'TOTAL BANQUE + CAISSE', style: 'total_banque_caisse' }]);

    body.push([{ text: '62', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'TOTAL DES SORTIES', style: 'total_sorties' }, { text: this.prettyEuros(fjdata.total_banque), style: 'montant_imp' }, { text: this.prettyEuros(fjdata.total_caisse), style: 'montant_imp' }, { text: this.prettyEuros(fjdata.total_bc), style: 'montant_imp' }]);
    body.push([{ text: '63', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'SOLDE (à reporter le mois suivant ligne 12)', style: 'solde' }, { text: this.prettyEuros(fjdata.solde_banque), style: 'montant' }, { text: this.prettyEuros(fjdata.solde_caisse), style: 'montant' }, { text: this.prettyEuros(fjdata.solde_bc), style: 'montant' }]);

    return body
  }

  private createDocumentDefinition(fjdata, opt) {
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

            body: this.createDDBody(fjdata, opt)
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
